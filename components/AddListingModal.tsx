import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, DollarSign, Tag, Package, Briefcase, Video, Image as ImageIcon, Trash2, Sparkles, MapPin, Loader2, Lock } from 'lucide-react';
import { Product } from '../types';
import { DETAILED_PRODUCT_CATEGORIES, SERVICE_CATEGORIES, KENYA_COUNTIES, MAJOR_TOWNS } from '../constants';
import { generateProductDescription, moderateListingContent } from '../services/geminiService';
import { canSellerPost, SubscriptionDetails } from '../services/sellerSubscriptionService';

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  productToEdit?: Product | null;
  initialType?: 'product' | 'service';
  initialCategory?: string;
  forceWholesale?: boolean;
  sellerId?: string;
  sellerEmail?: string;
  sellerPhone?: string;
}

const PHOTO_LIMIT = 10;
const VIDEO_LIMIT = 2;
const DIGITAL_CATEGORIES = ['Online Courses', 'Digital Designs', 'E-books & Guides', 'Software & Apps'];

const base64ToBlob = (base64: string, mimeType: string) => {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], {type: mimeType});
}

export const AddListingModal: React.FC<AddListingModalProps> = ({ isOpen, onClose, onSave, productToEdit, initialType, initialCategory, forceWholesale, sellerId, sellerEmail, sellerPhone }) => {
  const [listingType, setListingType] = useState<'product' | 'service'>('product');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [isWholesale, setIsWholesale] = useState(false);
  const [isDigital, setIsDigital] = useState(false);
  const [minOrder, setMinOrder] = useState('1');
  const [description, setDescription] = useState('');
  const [county, setCounty] = useState(KENYA_COUNTIES[0]);
  const [town, setTown] = useState(MAJOR_TOWNS[0]);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [isModerating, setIsModerating] = useState(false);
  const [resellerPhone, setResellerPhone] = useState('');
  const [paymentArrangement, setPaymentArrangement] = useState<Product['paymentArrangement']>('jiji_direct');

  useEffect(() => {
    if (isOpen) {
      if (productToEdit) {
        // Editing mode: Populate form with existing data
        const isService = SERVICE_CATEGORIES.includes(productToEdit.category);
        setListingType(isService ? 'service' : 'product');
        setTitle(productToEdit.title);
        setPrice(productToEdit.price ? String(productToEdit.price) : '');
        setCategory(productToEdit.category);
        setImage(productToEdit.image || null);
        setGallery(productToEdit.gallery || []);
        setVideos(productToEdit.video || []);
        setIsWholesale(productToEdit.isWholesale);
        setIsDigital(productToEdit.isDigital || DIGITAL_CATEGORIES.includes(productToEdit.category));
        setMinOrder(productToEdit.minOrder ? String(productToEdit.minOrder) : '1');
        setDescription(productToEdit.description);
        setCounty(productToEdit.county || KENYA_COUNTIES[0]);
        setTown(productToEdit.town || MAJOR_TOWNS[0]);
        setResellerPhone(productToEdit.seller_phone || sellerPhone || '');
        setPaymentArrangement(productToEdit.paymentArrangement || 'jiji_direct');
      } else {
        // Creating new mode: Reset all state, then apply initial config
        setTitle('');
        setPrice('');
        setImage(null);
        setGallery([]);
        setVideos([]);
        setDescription('');
        setMinOrder('1');
        setCounty(KENYA_COUNTIES[0]);
        setTown(MAJOR_TOWNS[0]);
        setResellerPhone(sellerPhone || '');
        setPaymentArrangement('jiji_direct');

        const type = initialType || 'product';
        setListingType(type);
        
        const defaultCategory = type === 'product' 
            ? DETAILED_PRODUCT_CATEGORIES[0]?.subcategories[0] || '' 
            : SERVICE_CATEGORIES[0] || '';
            
        const categoryList = type === 'service' 
            ? SERVICE_CATEGORIES 
            : DETAILED_PRODUCT_CATEGORIES.flatMap(c => c.subcategories);

        const selectedCategory = initialCategory && categoryList.includes(initialCategory) 
            ? initialCategory 
            : defaultCategory;
            
        setCategory(selectedCategory);
        setIsDigital(DIGITAL_CATEGORIES.includes(selectedCategory));
        setIsWholesale(!!forceWholesale);
      }
    }
  }, [isOpen, productToEdit, initialType, initialCategory, forceWholesale, sellerPhone]);

  if (!isOpen) return null;

  const handleFiles = (files: FileList | null | File[], type: 'cover' | 'gallery' | 'video') => {
    if (!files) return;

    const filesArray = Array.from(files);

    if (type === 'cover') {
      const file = filesArray[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } else if (type === 'gallery') {
      const galleryLimit = PHOTO_LIMIT - 1;
      if (gallery.length + filesArray.length > galleryLimit) {
        alert(`You can only upload a maximum of ${galleryLimit} gallery photos. You have ${galleryLimit - gallery.length} slots left.`);
        return;
      }
      filesArray.forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setGallery(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    } else if (type === 'video') {
      if (videos.length + filesArray.length > VIDEO_LIMIT) {
        alert(`You can only upload a maximum of ${VIDEO_LIMIT} videos.`);
        return;
      }
      filesArray.forEach((file: File) => {
        if (file.size > 20 * 1024 * 1024) {
          alert(`Video "${file.name}" is too large. Please upload clips under 20MB.`);
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setVideos(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, type: 'cover' | 'gallery' | 'video') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(type === 'cover' ? [files[0]] : files, type);
    }
  };


  const removeGalleryImage = (index: number) => {
    setGallery(prev => prev.filter((_, i) => i !== index));
  };
  
  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  const handleTypeChange = (type: 'product' | 'service') => {
      setListingType(type);
      const newCategory = type === 'product' ? DETAILED_PRODUCT_CATEGORIES[0].subcategories[0] : SERVICE_CATEGORIES[0];
      setCategory(newCategory);
      setIsWholesale(false);
      setIsDigital(DIGITAL_CATEGORIES.includes(newCategory));
  };
  
  const handleGenerateDescription = async () => {
    if (!title || !category) {
        alert("Please enter a title and select a category first.");
        return;
    }
    setIsGeneratingDesc(true);
    try {
        const generatedDesc = await generateProductDescription(title, category);
        if (generatedDesc) {
            setDescription(generatedDesc);
        } else {
            alert("Could not generate a description at this time.");
        }
    } catch (error) {
        console.error("Failed to generate description", error);
        alert("Could not generate a description at this time.");
    } finally {
        setIsGeneratingDesc(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !image || (listingType === 'product' && !price)) return;

    // ✨ SUBSCRIPTION CHECK: Only paid members can post
    if (!productToEdit && sellerId) { // Only check for new listings
        const canPost = await canSellerPost(sellerId, sellerEmail);
        if (!canPost) {
            setSubscriptionError('❌ Only paid subscribers can list items. Please choose a subscription plan to start selling.');
            return;
        }
    }
    setSubscriptionError(null); // Clear any previous errors

    // Real-time moderation check before saving
    if (!productToEdit) { // Only moderate new listings
        setIsModerating(true);
        const mimeType = image.split(';')[0].split(':')[1];
        const imageBase64 = image.split(',')[1];
        const moderationResult = await moderateListingContent(title, description, imageBase64, mimeType);

        if (!moderationResult.isApproved) {
            alert(`Listing rejected by AI moderator: ${moderationResult.reason}`);
            setIsModerating(false);
            return;
        }
        setIsModerating(false);
    }


    const productData: Product = {
      id: productToEdit?.id || Date.now().toString(),
      title,
      price: listingType === 'product' && price ? parseFloat(price) : undefined,
      currency: 'KES',
      image,
      category,
      isWholesale,
      minOrder: isWholesale ? parseInt(minOrder) : undefined,
      verified: productToEdit?.verified || false, 
      sellerId: productToEdit?.sellerId || '',
      sellerName: 'Me', // This will be replaced by the parent component
      description: description || 'No description provided.',
      gallery,
      video: videos,
      county: isDigital ? undefined : county,
      town: isDigital ? undefined : town,
      status: productToEdit?.status || 'Active',
      listingStatus: productToEdit ? productToEdit.listingStatus : 'active', // New listings are auto-approved by AI
      isDigital,
      seller_phone: resellerPhone.trim() || sellerPhone || undefined,
      paymentArrangement: listingType === 'product' && !isWholesale && !isDigital ? paymentArrangement : undefined,
    };

    onSave(productData);
    onClose();
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    // Automatically set isDigital based on the selected category
    if (DIGITAL_CATEGORIES.includes(newCategory)) {
        setIsDigital(true);
    } else if (listingType === 'product') {
        setIsDigital(false);
    }
  };

  const modalTitle = productToEdit ? `Edit ${listingType}` : `Add New ${listingType}`;
  const descriptionPlaceholder = isDigital
    ? "Describe your course, software, file formats, and what the customer will receive upon purchase..."
    : `Describe your ${listingType}, experience, and verification details...`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-orange-600 p-4 flex justify-between items-center text-white">
          <h2 className="text-lg font-bold">{modalTitle}</h2>
          <button onClick={onClose}><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
          
          {subscriptionError && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded flex items-start gap-3">
              <Lock size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Subscription Required</p>
                <p className="text-red-700 text-sm mt-1">{subscriptionError}</p>
                <button type="button" className="text-red-600 hover:text-red-800 text-sm font-semibold mt-2">
                  View Subscription Plans →
                </button>
              </div>
            </div>
          )}
          
          <div className="flex p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => handleTypeChange('product')}
                disabled={!!productToEdit || forceWholesale}
                className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 transition ${listingType === 'product' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'} disabled:cursor-not-allowed disabled:text-gray-400`}
              >
                  <Package size={16} /> Product
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('service')}
                disabled={!!productToEdit || forceWholesale}
                className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 transition ${listingType === 'service' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'} disabled:cursor-not-allowed disabled:text-gray-400`}
              >
                  <Briefcase size={16} /> Service
              </button>
          </div>

          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cover Photo (1 of {PHOTO_LIMIT})</label>
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'cover')}
                    className={`border-2 border-dashed rounded-lg h-32 flex flex-col items-center justify-center transition relative overflow-hidden bg-white ${isDragging ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-400'}`}
                  >
                    <input 
                        type="file" 
                        accept="image/jpeg, image/png"
                        onChange={(e) => handleFiles(e.target.files, 'cover')} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        required={!image}
                    />
                    {image ? (
                        <img src={image} alt="Preview" className="h-full w-full object-contain" />
                    ) : (
                        <div className="text-center text-gray-500 pointer-events-none">
                            <Upload className="mx-auto mb-2" size={24} />
                            <p className="text-xs">
                                <span className="font-semibold text-orange-600">Click to upload</span> or drag and drop
                            </p>
                             <p className="text-[10px] text-gray-400">PNG, JPG</p>
                        </div>
                    )}
                  </div>
              </div>
          
              <div>
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-2">
                      <ImageIcon size={16}/> Image Gallery ({gallery.length} of {PHOTO_LIMIT - 1})
                  </h3>
                  
                  <div className="grid grid-cols-5 gap-2">
                      {gallery.map((img, idx) => (
                          <div key={idx} className="relative aspect-square rounded overflow-hidden group">
                              <img src={img} className="w-full h-full object-cover" />
                              <button 
                                type="button" 
                                onClick={() => removeGalleryImage(idx)}
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition"
                              >
                                  <Trash2 size={12}/>
                              </button>
                          </div>
                      ))}
                      {gallery.length < PHOTO_LIMIT - 1 && (
                          <div 
                            onDrop={(e) => handleDrop(e, 'gallery')}
                            onDragOver={(e) => e.preventDefault()}
                            className="aspect-square border-2 border-dashed border-gray-300 rounded flex items-center justify-center bg-white cursor-pointer relative hover:border-orange-400 transition"
                          >
                               <input 
                                    type="file" 
                                    accept="image/jpeg, image/png"
                                    multiple
                                    onChange={(e) => handleFiles(e.target.files, 'gallery')} 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                               <Plus className="text-gray-400" />
                          </div>
                      )}
                  </div>
              </div>

              <div>
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-2 mt-4">
                      <Video size={16}/> Upload Videos ({videos.length} of {VIDEO_LIMIT})
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                      {videos.map((vid, idx) => (
                          <div key={idx} className="relative rounded-lg overflow-hidden bg-black aspect-video group">
                              <video src={vid} controls className="w-full h-full" />
                              <button 
                                type="button"
                                onClick={() => removeVideo(idx)}
                                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full shadow-md z-10 opacity-0 group-hover:opacity-100 transition"
                              >
                                  <Trash2 size={16} />
                              </button>
                          </div>
                      ))}
                      {videos.length < VIDEO_LIMIT && (
                          <div 
                            onDrop={(e) => handleDrop(e, 'video')}
                            onDragOver={(e) => e.preventDefault()}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center bg-white cursor-pointer relative hover:border-orange-400 transition aspect-video"
                          >
                               <input 
                                    type="file" 
                                    accept="video/*" 
                                    onChange={(e) => handleFiles(e.target.files, 'video')} 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                               <div className="flex flex-col items-center text-center text-gray-500 pointer-events-none">
                                   <Video className="mb-1" />
                                   <p className="text-xs">Drop video or click</p>
                                   <p className="text-[10px] text-gray-400">Max 20MB</p>
                               </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>

          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{listingType === 'product' ? 'Product Name' : 'Service Title'}</label>
              <input 
                required
                maxLength={70}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-orange-500 outline-none"
                placeholder={listingType === 'product' ? "e.g. Handmade Leather Bag" : "e.g. Professional Home Cleaning"}
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
              <p className="text-right text-xs text-gray-400 mt-1">{title.length}/70</p>
          </div>

          <div className="flex gap-4">
              {listingType === 'product' && (
                  <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-sm text-gray-500">
                              KES
                          </span>
                          <input 
                              required
                              type="number"
                              min="0"
                              step="any"
                              className="w-full border border-gray-300 rounded pl-12 pr-3 py-2 text-sm focus:border-orange-500 outline-none"
                              placeholder="0.00"
                              value={price}
                              onChange={e => setPrice(e.target.value)}
                          />
                      </div>
                  </div>
              )}
              <div className={listingType === 'product' ? 'flex-1' : 'w-full'}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-orange-500 outline-none"
                    value={category}
                    onChange={handleCategoryChange}
                  >
                    {listingType === 'product' ? (
                        DETAILED_PRODUCT_CATEGORIES.map(mainCat => (
                            <optgroup key={mainCat.name} label={mainCat.name}>
                                {mainCat.subcategories.map(subCat => (
                                    <option key={subCat} value={subCat}>{subCat}</option>
                                ))}
                            </optgroup>
                        ))
                    ) : (
                        SERVICE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)
                    )}
                  </select>
              </div>
          </div>

          {!isDigital && (
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <div className="flex gap-4">
                    <select
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-orange-500 outline-none bg-white"
                        value={county}
                        onChange={e => setCounty(e.target.value)}
                    >
                        {KENYA_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-orange-500 outline-none bg-white"
                        value={town}
                        onChange={e => setTown(e.target.value)}
                    >
                        {MAJOR_TOWNS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>
          )}

          {listingType === 'product' && !isWholesale && !isDigital && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Arrangement (Jiji Style)</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-orange-500 outline-none"
                value={paymentArrangement}
                onChange={(e) => setPaymentArrangement(e.target.value as Product['paymentArrangement'])}
              >
                <option value="jiji_direct">Jiji Direct (Buyer & Seller arrange payment)</option>
                <option value="mpesa">M-Pesa</option>
                <option value="cash_on_delivery">Cash on Delivery</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
          )}

          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seller Phone Number</label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-orange-500 outline-none"
                placeholder="e.g. 0712345678"
                value={resellerPhone}
                onChange={e => setResellerPhone(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">This number is shown to buyers for direct contact.</p>
          </div>

          {listingType === 'product' && !isDigital && (
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={isWholesale} 
                        onChange={e => setIsWholesale(e.target.checked)}
                        className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                        disabled={forceWholesale}
                    />
                    Is this a Wholesale (Bulk) item?
                </label>
                
                {isWholesale && (
                    <div className="ml-6">
                        <label className="block text-xs text-gray-500 mb-1">Minimum Order Quantity</label>
                        <input 
                            type="number" 
                            min="1"
                            className="w-32 border border-gray-300 rounded px-2 py-1 text-sm outline-none"
                            value={minOrder}
                            onChange={e => setMinOrder(e.target.value)}
                        />
                    </div>
                )}
            </div>
          )}

           <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={isGeneratingDesc || !title || !category}
                    className="flex items-center gap-1 text-xs text-orange-600 font-semibold hover:text-orange-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    <Sparkles size={14} />
                    {isGeneratingDesc ? 'Generating...' : 'Generate with AI'}
                </button>
              </div>
              <textarea 
                id="description"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-orange-500 outline-none"
                rows={3}
                placeholder={descriptionPlaceholder}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
          </div>

          <button 
            type="submit" 
            disabled={!title || !image || (listingType === 'product' && !price) || isModerating}
            className="w-full bg-orange-600 text-white font-bold py-3 rounded hover:bg-orange-700 transition disabled:bg-gray-300 disabled:cursor-wait flex items-center justify-center gap-2 shadow-md"
          >
              {isModerating ? <><Loader2 size={18} className="animate-spin" /> Moderating...</> : <><Plus size={18} /> {productToEdit ? 'Save Changes' : `Post ${listingType}`}</>}
          </button>

        </form>
      </div>
    </div>
  );
};
