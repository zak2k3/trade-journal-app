import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createTrade, updateTrade, fetchTrade, clearError } from '../store/tradesSlice';
import { fetchTags } from '../store/tagsSlice';

const TradeForm = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentTrade, loading, error } = useSelector((state) => state.trades);
  const { tags } = useSelector((state) => state.tags);

  const [formData, setFormData] = useState({
    ticker: '',
    entry_price: '',
    exit_price: '',
    quantity: '',
    trade_date: new Date().toISOString().split('T')[0],
    notes: '',
    strategy: '',
    direction: 'long',
    status: 'closed',
    tags: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  useEffect(() => {
    dispatch(fetchTags());
    if (isEditing) {
      dispatch(fetchTrade(id));
    }
    return () => {
      dispatch(clearError());
    };
  }, [dispatch, id, isEditing]);

  useEffect(() => {
    if (currentTrade && isEditing) {
      setFormData({
        ticker: currentTrade.ticker,
        entry_price: currentTrade.entry_price,
        exit_price: currentTrade.exit_price,
        quantity: currentTrade.quantity,
        trade_date: currentTrade.trade_date,
        notes: currentTrade.notes || '',
        strategy: currentTrade.strategy || '',
        direction: currentTrade.direction,
        status: currentTrade.status,
        tags: currentTrade.tags?.map(t => t.name) || [],
      });
    }
  }, [currentTrade, isEditing]);

  const validateForm = () => {
    const errors = {};
    if (!formData.ticker.trim()) {
      errors.ticker = 'Ticker is required';
    } else if (formData.ticker.length > 10) {
      errors.ticker = 'Ticker must be 10 characters or less';
    }
    if (!formData.entry_price) {
      errors.entry_price = 'Entry price is required';
    } else if (parseFloat(formData.entry_price) < 0) {
      errors.entry_price = 'Entry price must be positive';
    }
    if (!formData.exit_price) {
      errors.exit_price = 'Exit price is required';
    } else if (parseFloat(formData.exit_price) < 0) {
      errors.exit_price = 'Exit price must be positive';
    }
    if (!formData.quantity) {
      errors.quantity = 'Quantity is required';
    } else if (parseInt(formData.quantity) < 1) {
      errors.quantity = 'Quantity must be at least 1';
    }
    if (!formData.trade_date) {
      errors.trade_date = 'Trade date is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleTagToggle = (tagName) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagName)
        ? prev.tags.filter(t => t !== tagName)
        : [...prev.tags, tagName],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const tradeData = {
        ...formData,
        entry_price: parseFloat(formData.entry_price),
        exit_price: parseFloat(formData.exit_price),
        quantity: parseInt(formData.quantity),
      };

      if (isEditing) {
        await dispatch(updateTrade({ id, data: tradeData }));
      } else {
        await dispatch(createTrade(tradeData));
      }
      navigate('/trades');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditing ? 'Edit Trade' : 'Add New Trade'}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ticker">
              Ticker Symbol *
            </label>
            <input
              type="text"
              id="ticker"
              name="ticker"
              value={formData.ticker}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.ticker ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., AAPL"
            />
            {formErrors.ticker && (
              <p className="text-red-500 text-xs mt-1">{formErrors.ticker}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="direction">
              Direction *
            </label>
            <select
              id="direction"
              name="direction"
              value={formData.direction}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="entry_price">
              Entry Price *
            </label>
            <input
              type="number"
              step="0.01"
              id="entry_price"
              name="entry_price"
              value={formData.entry_price}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.entry_price ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {formErrors.entry_price && (
              <p className="text-red-500 text-xs mt-1">{formErrors.entry_price}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="exit_price">
              Exit Price *
            </label>
            <input
              type="number"
              step="0.01"
              id="exit_price"
              name="exit_price"
              value={formData.exit_price}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.exit_price ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {formErrors.exit_price && (
              <p className="text-red-500 text-xs mt-1">{formErrors.exit_price}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">
              Quantity *
            </label>
            <input
              type="number"
              min="1"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.quantity ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="1"
            />
            {formErrors.quantity && (
              <p className="text-red-500 text-xs mt-1">{formErrors.quantity}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="trade_date">
              Trade Date *
            </label>
            <input
              type="date"
              id="trade_date"
              name="trade_date"
              value={formData.trade_date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.trade_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.trade_date && (
              <p className="text-red-500 text-xs mt-1">{formErrors.trade_date}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
              Status *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Tags Selection */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Tags
          </label>
          <div className="relative">
            <div
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer min-h-[42px] flex flex-wrap gap-2"
              onClick={() => setShowTagDropdown(!showTagDropdown)}
            >
              {formData.tags.length === 0 ? (
                <span className="text-gray-400">Select tags...</span>
              ) : (
                formData.tags.map((tag) => {
                  const tagData = tags.find(t => t.name === tag);
                  return (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs font-semibold rounded-full flex items-center gap-1"
                      style={{
                        backgroundColor: tagData?.color || '#3B82F6',
                        color: '#fff',
                      }}
                    >
                      {tag}
                    </span>
                  );
                })
              )}
            </div>
            
            {showTagDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {tags.length === 0 ? (
                  <div className="px-3 py-2 text-gray-500 text-sm">
                    No tags available. Create tags first.
                  </div>
                ) : (
                  tags.map((tag) => (
                    <div
                      key={tag.id}
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2 ${
                        formData.tags.includes(tag.name) ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleTagToggle(tag.name)}
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span>{tag.name}</span>
                      {formData.tags.includes(tag.name) && (
                        <span className="ml-auto text-blue-600">✓</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add any notes about this trade (setup, emotions, lessons learned, etc.)..."
          />
        </div>

        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="strategy">
                Strategy
            </label>
            <select
                id="strategy"
                name="strategy"
                value={formData.strategy}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">Select strategy...</option>
                <option value="Breakout">Breakout</option>
                <option value="Pullback">Pullback</option>
                <option value="Reversal">Reversal</option>
                <option value="Momentum">Momentum</option>
                <option value="Swing Trade">Swing Trade</option>
                <option value="Day Trade">Day Trade</option>
                <option value="Scalp">Scalp</option>
                <option value="Trend Following">Trend Following</option>
                <option value="Value">Value</option>
                <option value="Other">Other</option>
            </select>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Trade' : 'Create Trade'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/trades')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TradeForm;