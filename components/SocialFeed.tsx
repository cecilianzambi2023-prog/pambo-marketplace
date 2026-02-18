import React from 'react';
import { User, Post, Product, LiveStream } from '../types';
// FIX: Import 'Users' icon from 'lucide-react' to fix a 'Cannot find name' error.
import { Heart, MessageCircle, Share2, MoreHorizontal, Clock, Users, Wifi } from 'lucide-react';

// Helper to format timestamps
const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

const PostCard: React.FC<{ post: Post, author?: User, product?: Product, onViewProduct: (product: Product) => void, isLive: boolean }> = ({ post, author, product, onViewProduct, isLive }) => {
    if (!author) return null;

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            {/* Post Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                     <div className="relative">
                        {isLive && <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 animate-pulse"></div>}
                        <img src={author.avatar} alt={author.name} className="w-10 h-10 rounded-full object-cover relative border-2 border-white" />
                     </div>
                    <div>
                        <p className="font-bold text-sm text-gray-800">{author.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12}/> {timeAgo(post.timestamp)}</p>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal /></button>
            </div>

            {/* Post Content */}
            <p className="text-gray-700 text-sm mb-3">{post.text}</p>
            
            {post.imageUrl && !product && (
                <div className="rounded-lg overflow-hidden border border-gray-200 mb-3">
                    <img src={post.imageUrl} alt="Post content" className="w-full h-auto object-cover" />
                </div>
            )}
            
            {/* Attached Product */}
            {product && (
                <div 
                    onClick={() => onViewProduct(product)}
                    className="border border-gray-200 rounded-lg flex items-center gap-4 p-3 mb-3 hover:bg-gray-50 transition cursor-pointer"
                >
                    <img src={product.image} alt={product.title} className="w-16 h-16 object-cover rounded-md" />
                    <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-800 line-clamp-1">{product.title}</p>
                        <p className="text-orange-600 font-bold text-sm">KES {product.price?.toLocaleString()}</p>
                    </div>
                    <button className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-md hover:bg-orange-200 transition">
                        View
                    </button>
                </div>
            )}
            
            {/* Post Actions */}
            <div className="flex items-center justify-between text-gray-500 border-t border-gray-100 pt-2">
                <button className="flex items-center gap-1.5 text-sm hover:text-red-500 transition"><Heart size={16} /> Like</button>
                <button className="flex items-center gap-1.5 text-sm hover:text-blue-500 transition"><MessageCircle size={16} /> Comment</button>
                <button className="flex items-center gap-1.5 text-sm hover:text-green-500 transition"><Share2 size={16} /> Share</button>
            </div>
        </div>
    );
};


interface SocialFeedProps {
    currentUser: User;
    posts: Post[];
    sellers: User[];
    products: Product[];
    onViewProduct: (product: Product) => void;
    liveStreams: LiveStream[];
}

export const SocialFeed: React.FC<SocialFeedProps> = ({ currentUser, posts, sellers, products, onViewProduct, liveStreams }) => {
    
    const followedPosts = posts
        .filter(post => currentUser.following.includes(post.authorId))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="max-w-2xl mx-auto space-y-4">
             <h1 className="text-2xl font-bold text-gray-800">Your Feed</h1>
            {followedPosts.length > 0 ? (
                followedPosts.map(post => {
                    const author = sellers.find(s => s.id === post.authorId);
                    const product = products.find(p => p.id === post.productId);
                    const isLive = liveStreams.some(s => s.sellerId === post.authorId && s.status === 'live');
                    return <PostCard key={post.id} post={post} author={author} product={product} onViewProduct={onViewProduct} isLive={isLive} />;
                })
            ) : (
                <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
                    <Users size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700">Your Feed is Empty</h3>
                    <p className="text-gray-500 mt-1">Follow sellers to see their updates and products here!</p>
                </div>
            )}
        </div>
    );
};