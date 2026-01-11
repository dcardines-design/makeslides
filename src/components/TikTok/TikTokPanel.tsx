'use client';

import { useState, useEffect } from 'react';
import { Loader2, LogOut, Upload, BarChart3, ExternalLink, User } from 'lucide-react';

interface TikTokUser {
  open_id: string;
  display_name: string;
  avatar_url: string;
  username?: string;
  follower_count?: number;
  following_count?: number;
  likes_count?: number;
  video_count?: number;
}

interface TikTokVideo {
  id: string;
  title: string;
  video_description: string;
  cover_image_url: string;
  share_url: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  create_time: number;
}

interface TikTokStats {
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
}

interface TikTokPanelProps {
  onUpload?: () => Promise<string[]>; // Returns array of image URLs to upload
}

export default function TikTokPanel({ onUpload }: TikTokPanelProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<TikTokUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analytics, setAnalytics] = useState<{ videos: TikTokVideo[]; stats: TikTokStats } | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    checkConnection();

    // Check for TikTok connection result in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('tiktok_connected') === 'true') {
      checkConnection();
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('tiktok_error')) {
      alert(`TikTok connection failed: ${params.get('tiktok_error')}`);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/tiktok/profile');
      const data = await response.json();
      setIsConnected(data.connected);
      setUser(data.user || null);
    } catch (error) {
      console.error('Failed to check TikTok connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const response = await fetch('/api/tiktok/auth');
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        alert('Failed to get TikTok authorization URL');
      }
    } catch (error) {
      console.error('Failed to start TikTok auth:', error);
      alert('Failed to connect to TikTok');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch('/api/tiktok/profile', { method: 'DELETE' });
      setIsConnected(false);
      setUser(null);
      setAnalytics(null);
      setShowAnalytics(false);
    } catch (error) {
      console.error('Failed to disconnect TikTok:', error);
    }
  };

  const handleUpload = async () => {
    if (!onUpload) return;

    setUploading(true);
    try {
      const imageUrls = await onUpload();
      if (!imageUrls || imageUrls.length === 0) {
        alert('No slides to upload');
        return;
      }

      const response = await fetch('/api/tiktok/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: imageUrls,
          title: 'My TikTok Slides',
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Slides uploaded to TikTok successfully!');
      } else {
        alert(`Upload failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload to TikTok');
    } finally {
      setUploading(false);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const response = await fetch('/api/tiktok/analytics');
      const data = await response.json();
      if (!data.error) {
        setAnalytics({ videos: data.videos, stats: data.stats });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const toggleAnalytics = () => {
    if (!showAnalytics && !analytics) {
      fetchAnalytics();
    }
    setShowAnalytics(!showAnalytics);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 size={18} className="text-[#3B1DD1] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!isConnected ? (
        <button
          onClick={() => window.open('/design', '_blank')}
          className="w-full px-[14px] py-3 rounded-[10px] bg-[#1F1F1F] border border-[#2B2B2B] text-white font-medium text-[12px] tracking-[1px] transition-colors hover:bg-[#2a2a2a] hover:border-[#3B1CD1] flex items-center justify-center gap-2"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
          DESIGN COMPONENTS
        </button>
      ) : (
        <>
          {/* Connected User */}
          <div className="p-3 bg-[#1F1F1F] border border-[#2B2B2B] rounded-[10px]">
            <div className="flex items-center gap-3">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.display_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#2B2B2B] flex items-center justify-center">
                  <User size={18} className="text-[#666]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {user?.display_name || 'TikTok User'}
                </p>
                {user?.username && (
                  <p className="text-[#666] text-xs truncate">@{user.username}</p>
                )}
              </div>
              <button
                onClick={handleDisconnect}
                className="p-2 text-[#666] hover:text-red-500 transition-colors"
                title="Disconnect TikTok"
              >
                <LogOut size={16} />
              </button>
            </div>

            {/* User Stats */}
            {(user?.follower_count !== undefined || user?.likes_count !== undefined) && (
              <div className="mt-3 pt-3 border-t border-[#2B2B2B] grid grid-cols-3 gap-2 text-center">
                {user?.follower_count !== undefined && (
                  <div>
                    <p className="text-white text-sm font-medium">{formatNumber(user.follower_count)}</p>
                    <p className="text-[#666] text-[10px]">Followers</p>
                  </div>
                )}
                {user?.following_count !== undefined && (
                  <div>
                    <p className="text-white text-sm font-medium">{formatNumber(user.following_count)}</p>
                    <p className="text-[#666] text-[10px]">Following</p>
                  </div>
                )}
                {user?.likes_count !== undefined && (
                  <div>
                    <p className="text-white text-sm font-medium">{formatNumber(user.likes_count)}</p>
                    <p className="text-[#666] text-[10px]">Likes</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              disabled={uploading || !onUpload}
              className="flex-1 px-3 py-2.5 rounded-[10px] bg-[#3B1FD1] border border-[#6345FA] text-white font-medium text-[11px] tracking-[1px] transition-colors hover:bg-[#4B2DE1] disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {uploading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Upload size={12} />
              )}
              POST
            </button>
            <button
              onClick={toggleAnalytics}
              className={`flex-1 px-3 py-2.5 rounded-[10px] border font-medium text-[11px] tracking-[1px] transition-colors flex items-center justify-center gap-2 ${
                showAnalytics
                  ? 'bg-[#3B1FD1] border-[#6345FA] text-white'
                  : 'bg-[#1F1F1F] border-[#2B2B2B] text-white hover:border-[#3B1CD1]'
              }`}
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              <BarChart3 size={12} />
              ANALYTICS
            </button>
          </div>

          {/* Analytics Panel */}
          {showAnalytics && (
            <div className="p-3 bg-[#1F1F1F] border border-[#2B2B2B] rounded-[10px] space-y-3">
              {analyticsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 size={18} className="text-[#3B1DD1] animate-spin" />
                </div>
              ) : analytics ? (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-[#0a0a0a] rounded-lg text-center">
                      <p className="text-white text-lg font-bold">{formatNumber(analytics.stats.totalViews)}</p>
                      <p className="text-[#666] text-[10px]">Total Views</p>
                    </div>
                    <div className="p-2 bg-[#0a0a0a] rounded-lg text-center">
                      <p className="text-white text-lg font-bold">{formatNumber(analytics.stats.totalLikes)}</p>
                      <p className="text-[#666] text-[10px]">Total Likes</p>
                    </div>
                    <div className="p-2 bg-[#0a0a0a] rounded-lg text-center">
                      <p className="text-white text-lg font-bold">{formatNumber(analytics.stats.totalComments)}</p>
                      <p className="text-[#666] text-[10px]">Comments</p>
                    </div>
                    <div className="p-2 bg-[#0a0a0a] rounded-lg text-center">
                      <p className="text-white text-lg font-bold">{formatNumber(analytics.stats.totalShares)}</p>
                      <p className="text-[#666] text-[10px]">Shares</p>
                    </div>
                  </div>

                  {/* Recent Videos */}
                  {analytics.videos.length > 0 && (
                    <div>
                      <p className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}>
                        Recent Posts
                      </p>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {analytics.videos.slice(0, 5).map((video) => (
                          <a
                            key={video.id}
                            href={video.share_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 bg-[#0a0a0a] rounded-lg hover:bg-[#151515] transition-colors"
                          >
                            <img
                              src={video.cover_image_url}
                              alt=""
                              className="w-10 h-10 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-xs truncate">
                                {video.title || video.video_description || 'Untitled'}
                              </p>
                              <p className="text-[#666] text-[10px]">
                                {formatNumber(video.view_count)} views
                              </p>
                            </div>
                            <ExternalLink size={12} className="text-[#666]" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-[#666] text-sm text-center py-4">
                  No analytics available
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
