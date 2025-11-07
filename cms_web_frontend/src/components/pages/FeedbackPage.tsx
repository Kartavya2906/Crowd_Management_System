import { useState, useEffect } from 'react';
import { Star, TrendingUp, BarChart3, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Event, Feedback } from '../../types';

interface FeedbackPageProps {
  events: Event[];
}

interface FeedbackStats {
  avgRating: number;
  totalFeedback: number;
  categoryBreakdown: Record<string, { avg: number; count: number }>;
  ratingDistribution: Record<number, number>;
}

export default function FeedbackPage({ events }: FeedbackPageProps) {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [stats, setStats] = useState<FeedbackStats | null>(null);

  useEffect(() => {
    if (selectedEvent) {
      loadFeedback();
    }
  }, [selectedEvent]);

  const loadFeedback = async () => {
    const { data } = await supabase
      .from('feedback')
      .select('*')
      .eq('event_id', selectedEvent)
      .order('created_at', { ascending: false });

    if (data) {
      setFeedback(data);
      calculateStats(data);
    }
  };

  const calculateStats = (feedbackData: Feedback[]) => {
    if (feedbackData.length === 0) {
      setStats(null);
      return;
    }

    const avgRating = feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length;

    const categoryBreakdown: Record<string, { avg: number; count: number }> = {};
    const categories = ['general', 'safety', 'navigation', 'facilities', 'emergency'];

    categories.forEach(cat => {
      const categoryFeedback = feedbackData.filter(f => f.category === cat);
      if (categoryFeedback.length > 0) {
        categoryBreakdown[cat] = {
          avg: categoryFeedback.reduce((sum, f) => sum + f.rating, 0) / categoryFeedback.length,
          count: categoryFeedback.length
        };
      }
    });

    const ratingDistribution: Record<number, number> = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };
    feedbackData.forEach(f => {
      ratingDistribution[f.rating]++;
    });

    setStats({
      avgRating,
      totalFeedback: feedbackData.length,
      categoryBreakdown,
      ratingDistribution
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      general: 'text-blue-400',
      safety: 'text-red-400',
      navigation: 'text-green-400',
      facilities: 'text-purple-400',
      emergency: 'text-amber-400'
    };
    return colors[category] || 'text-gray-400';
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-2">Feedback Analysis</h1>
      <p className="text-gray-300 mb-8">Analyze user feedback and generate insights</p>

      <div className="mb-8">
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Select an event</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>{event.name}</option>
          ))}
        </select>
      </div>

      {selectedEvent && stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg rounded-xl p-6 border border-blue-400/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-blue-200 text-sm">Overall Rating</p>
                <Star className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-bold text-white">
                  {stats.avgRating.toFixed(1)}
                </p>
                <p className="text-gray-300 mb-1">/ 5.0</p>
              </div>
              {renderStars(Math.round(stats.avgRating))}
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-lg rounded-xl p-6 border border-purple-400/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-purple-200 text-sm">Total Responses</p>
                <MessageSquare className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-4xl font-bold text-white">
                {stats.totalFeedback}
              </p>
              <p className="text-gray-300 text-sm mt-1">feedback submissions</p>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-lg rounded-xl p-6 border border-green-400/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-green-200 text-sm">Safety Rating</p>
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-bold text-white">
                  {stats.categoryBreakdown.safety?.avg.toFixed(1) || 'N/A'}
                </p>
                {stats.categoryBreakdown.safety && (
                  <p className="text-gray-300 mb-1">/ 5.0</p>
                )}
              </div>
              <p className="text-gray-300 text-sm mt-1">
                {stats.categoryBreakdown.safety?.count || 0} responses
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Category Breakdown
              </h3>
              <div className="space-y-4">
                {Object.entries(stats.categoryBreakdown).map(([category, data]) => (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`font-medium capitalize ${getCategoryColor(category)}`}>
                        {category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{data.avg.toFixed(1)}</span>
                        <span className="text-gray-400 text-sm">({data.count})</span>
                      </div>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                        style={{ width: `${(data.avg / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Rating Distribution</h3>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-white font-medium w-12">{rating} Star</span>
                    <div className="flex-1 h-6 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-end pr-2"
                        style={{
                          width: `${(stats.ratingDistribution[rating] / stats.totalFeedback) * 100}%`
                        }}
                      >
                        {stats.ratingDistribution[rating] > 0 && (
                          <span className="text-xs text-white font-medium">
                            {stats.ratingDistribution[rating]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6">Recent Feedback</h3>
            <div className="space-y-4">
              {feedback.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {renderStars(item.rating)}
                      <span className={`text-sm px-2 py-1 rounded-full bg-blue-500/20 capitalize ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {item.comment && (
                    <p className="text-gray-300 text-sm">{item.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
