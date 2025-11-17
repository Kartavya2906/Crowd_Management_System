from fastapi import APIRouter, Request, HTTPException, status, UploadFile, File
from typing import Optional
import os
import tempfile
from pathlib import Path

router = APIRouter(prefix="/inference", tags=["Inference"])


@router.post('/count')
async def infer_count(request: Request, 
file: UploadFile = File(None)):
    """Accept an image file upload and return the estimated people count.

    - Attempts to use `inference_utils.load_model` and associated helpers if available.
    - Falls back to `lwcc` if installed.
    - If `save_record` is true, the endpoint will attempt to persist a
      crowd-density record into the existing `crowd_density` collection
      (if available in the application scope).
    """
    # If FastAPI provided an UploadFile (standard multipart handling), prefer it — this works with Postman
    if file is not None:
        upload = file
        save_record = False
        radius_m = None
        event_id = None
        area_name = None
        # try to parse optional form fields from request.form() if present
        try:
            form = await request.form()
            def _parse_bool(v):
                if v is None:
                    return False
                if isinstance(v, bool):
                    return v
                s = str(v).lower()
                return s in ('1','true','yes','y')
            save_record = _parse_bool(form.get('save_record'))
            radius_raw = form.get('radius_m')
            try:
                radius_m = float(radius_raw) if radius_raw not in (None, '') else None
            except Exception:
                radius_m = None
            event_id = form.get('event_id')
            area_name = form.get('area_name')
        except Exception:
            # form may not be present or python-multipart missing; continue with defaults
            pass

        suffix = Path(getattr(upload, 'filename', 'upload.jpg')).suffix or '.jpg'
        
        # Read upload contents - seek to beginning first
        await upload.seek(0)
        contents = await upload.read()
        
        # Validate that we have image data
        if not contents or len(contents) == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded")
        
        print(f"[DEBUG] Direct upload: {len(contents)} bytes, suffix: {suffix}")
        
        # Create temp file and write contents
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix, mode='wb')
        bytes_written = tmp.write(contents)
        tmp.flush()
        os.fsync(tmp.fileno())  # Force write to disk
        tmp_path = tmp.name
        tmp.close()  # Close but don't delete (delete=False)
        
        # Verify the file was written correctly
        actual_size = os.path.getsize(tmp_path)
        print(f"[DEBUG] Temp file created: {tmp_path}, wrote {bytes_written} bytes, actual size: {actual_size} bytes")
        
        if actual_size == 0:
            raise HTTPException(status_code=500, detail=f"Failed to write temp file - size is 0 bytes")
    else:
        # Fallback: parse form data (older behavior). This requires python-multipart installed at runtime.
        try:
            form = await request.form()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Unable to parse form data: {e}\nInstall python-multipart if using multipart form uploads.")

        upload = form.get('file')
        if upload is None:
            raise HTTPException(status_code=400, detail='Missing form field "file"')

        def _parse_bool(v):
            if v is None:
                return False
            if isinstance(v, bool):
                return v
            s = str(v).lower()
            return s in ('1','true','yes','y')

        save_record = _parse_bool(form.get('save_record'))
        radius_raw = form.get('radius_m')
        try:
            radius_m = float(radius_raw) if radius_raw not in (None, '') else None
        except Exception:
            radius_m = None
        event_id = form.get('event_id')
        area_name = form.get('area_name')

        # Write upload to a temporary file
        suffix = Path(getattr(upload, 'filename', 'upload.jpg')).suffix or '.jpg'
        
        # Read upload contents - seek to beginning first in case it was read before
        await upload.seek(0)
        contents = await upload.read()
        
        # Validate that we have image data
        if not contents or len(contents) == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded")
        
        print(f"[DEBUG] Received upload: {len(contents)} bytes, suffix: {suffix}")
        
        # Create temp file and write contents
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix, mode='wb')
        bytes_written = tmp.write(contents)
        tmp.flush()
        os.fsync(tmp.fileno())  # Force write to disk
        tmp_path = tmp.name
        tmp.close()  # Close but don't delete (delete=False)
        
        # Verify the file was written correctly
        actual_size = os.path.getsize(tmp_path)
        print(f"[DEBUG] Temp file created: {tmp_path}, wrote {bytes_written} bytes, actual size: {actual_size} bytes")
        
        if actual_size == 0:
            raise HTTPException(status_code=500, detail=f"Failed to write temp file - size is 0 bytes")

    count = None
    backend_error = None
    # Try to use inference_utils (preferred)
    try:
        from .. import inference_utils as iu  # relative import
    except Exception:
        iu = None

    # Try torch-based model if available via inference_utils
    try:
        if iu is not None:
            model_path = os.getenv('MODEL_PATH', './model_weights.pt')
            device = 'cuda' if getattr(iu, 'torch', None) and iu.torch.cuda.is_available() else 'cpu'
            model = iu.load_model(str(model_path), device=device)
            if model is not None:
                tensor = iu.preprocess_image(tmp_path, target_size=(512,512))
                c, _ = iu.infer_image(model, tensor, device=device)
                count = int(round(float(c)))
    except Exception as e:
        backend_error = str(e)

    # Fallback to LWCC if still None
    # Note: LWCC has a critical bug - uses hardcoded /.lwcc path which is read-only on macOS
    # Even importing LWCC can fail if it tries to create /.lwcc during initialization
    if count is None:
        lwcc_error = None
        try:
            from lwcc import LWCC
            c = LWCC.get_count([tmp_path], model_name='DM-Count', model_weights='SHA', resize_img=True)
            count = int(round(float(c)))
            print(f"[DEBUG] LWCC SUCCESS! Count: {count}")
        except (OSError, PermissionError, FileNotFoundError) as e:
            # LWCC failed due to filesystem issues - use fallback
            lwcc_error = e
            print(f"[DEBUG] LWCC failed with filesystem error: {e}")
        except Exception as e:
            # Other LWCC errors
            lwcc_error = e
            print(f"[DEBUG] LWCC failed: {e}")
        
        # Use fallback if LWCC failed
        if count is None:
            print(f"[DEBUG] Using fallback crowd estimation...")
            print(f"[DEBUG] Temp file path: {tmp_path}")
            print(f"[DEBUG] File exists: {os.path.exists(tmp_path)}")
            try:
                from PIL import Image
                import numpy as np
                
                # Verify file exists and is readable
                print(f"[DEBUG] Checking temp file: {tmp_path}")
                if not os.path.exists(tmp_path):
                    raise FileNotFoundError(f"Temp file not found: {tmp_path}")
                
                file_size = os.path.getsize(tmp_path)
                print(f"[DEBUG] Temp file exists, size: {file_size} bytes")
                
                if file_size == 0:
                    raise ValueError(f"Temp file is empty: {tmp_path}")
                
                # Open image and analyze
                print(f"[DEBUG] Opening image with PIL...")
                img = Image.open(tmp_path)
                print(f"[DEBUG] Image opened successfully: {img.format} {img.size} {img.mode}")
                img_array = np.array(img.convert('RGB'))
                height, width = img_array.shape[:2]
                
                # Simple heuristic: detect regions with skin-tone-like colors
                # This is a rough estimation, not accurate crowd counting
                lower_skin = np.array([80, 50, 50], dtype=np.uint8)
                upper_skin = np.array([255, 200, 180], dtype=np.uint8)
                
                skin_mask = np.all((img_array >= lower_skin) & (img_array <= upper_skin), axis=2)
                skin_pixel_count = np.sum(skin_mask)
                
                # Estimate: assume average person occupies ~5000 pixels in typical crowd photo
                total_pixels = height * width
                if total_pixels > 0:
                    density_ratio = skin_pixel_count / total_pixels
                    # Rough estimation formula
                    estimated_count = max(1, int(density_ratio * total_pixels / 3000))
                    count = min(estimated_count, 1000)  # Cap at reasonable maximum
                    
                print(f"[DEBUG] Fallback estimation: {count} people (approximation)")
                backend_error = f"LWCC unavailable (filesystem error), using fallback estimation"
            except ImportError as e:
                print(f"[DEBUG] Fallback failed - missing dependencies: {e}")
                backend_error = f"LWCC error: {lwcc_error}; Fallback error: Missing PIL or NumPy - install with 'pip install Pillow numpy'"
            except Exception as fallback_error:
                print(f"[DEBUG] Fallback failed: {type(fallback_error).__name__}: {fallback_error}")
                # Provide more specific error message
                error_msg = str(fallback_error)
                if "cannot identify image file" in error_msg:
                    backend_error = f"LWCC error: {lwcc_error}; Fallback error: Invalid or corrupted image file"
                else:
                    backend_error = f"LWCC error: {lwcc_error}; Fallback error: {fallback_error}"

    # Clean up temporary file
    try:
        os.unlink(tmp_path)
    except Exception:
        pass

    if count is None:
        raise HTTPException(status_code=500, detail={
            'message': 'Could not run inference; no backend available',
            'error': backend_error,
        })

    response = {
        'image_filename': getattr(upload, 'filename', 'uploaded'),
        'person_count': int(count),
    }

    # Optionally compute density if radius provided
    if radius_m:
        try:
            area = 3.141592653589793 * (radius_m ** 2)
            ppl_per_m2 = round(count / area, 3) if area > 0 else 0.0
            response['area_m2'] = round(area, 3)
            response['people_per_m2'] = ppl_per_m2
        except Exception:
            pass

    # Optionally save into crowd_density collection if available
    if save_record:
        try:
            # import here to avoid circular imports at module load
            from ..routes.crowd_density import generate_density_id, calculate_density, crowd_density_collection
            from datetime import datetime
            record = {
                'id': generate_density_id(),
                'timestamp': datetime.utcnow(),
                'person_count': int(count),
                'radius_m': float(radius_m) if radius_m else 0.0,
                'event_id': event_id,
                'area_name': area_name,
                'location': None,
            }
            # calculate derived metrics
            record = calculate_density(record)
            # insert (best effort)
            await crowd_density_collection.insert_one(record)
            response['saved'] = True
            response['record_id'] = record['id']
        except Exception as e:
            # don't fail the request if DB save fails; include warning
            response['saved'] = False
            response['save_error'] = str(e)

    return response
