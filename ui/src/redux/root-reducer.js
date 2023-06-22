import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
// slices
import { combineReducers } from 'redux';
import checkoutReducer from './slices/checkout';

// ----------------------------------------------------------------------

const checkoutPersistConfig = {
  key: 'checkout',
  storage,
  keyPrefix: 'redux-',
};

export const rootReducer = combineReducers({
  checkout: persistReducer(checkoutPersistConfig, checkoutReducer),
});
