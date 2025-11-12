from fastapi import APIRouter, HTTPException
from bson import ObjectId
from database import db
from models import Item

router = APIRouter(prefix="/items", tags=["Items"])

collection = db["items"]

@router.post("/", response_model=dict)
def create_item(item: Item):
    result = collection.insert_one(item.model_dump())
    return {"_id": str(result.inserted_id), **item.model_dump()}

@router.get("/", response_model=list)
def get_items():
    items = []
    for item in collection.find():
        item["_id"] = str(item["_id"])
        items.append(item)
    return items

@router.get("/{item_id}", response_model=dict)
def get_item(item_id: str):
    item = collection.find_one({"_id": ObjectId(item_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item["_id"] = str(item["_id"])
    return item

@router.put("/{item_id}", response_model=dict)
def update_item(item_id: str, item: Item):
    updated = collection.find_one_and_update(
        {"_id": ObjectId(item_id)},
        {"$set": item.model_dump()},
        return_document=True
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Item not found")
    updated["_id"] = str(updated["_id"])
    return updated

@router.delete("/{item_id}", response_model=dict)
def delete_item(item_id: str):
    result = collection.delete_one({"_id": ObjectId(item_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"status": "deleted"}