import { PopulateOptions } from 'mongoose';

export const CartProductPopulate: PopulateOptions = {
  path: 'items.product',
  select: 'title description sku slug price stock category imageUrl',
  populate: {
    path: 'category',
    select: 'title',
  },
};

export const OrderProductPopulate: PopulateOptions = {
  path: 'items.product',
  select: 'title description sku slug price stock category imageUrl',
  populate: {
    path: 'category',
    select: 'title',
  },
};
