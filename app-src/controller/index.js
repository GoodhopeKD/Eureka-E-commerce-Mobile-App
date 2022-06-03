import EntityDisplayCardResource from './types/extra/EntityDisplayCardResource';
import HostResource from './types/extra/HostResource';
import VisitViewFollowCountResource from './types/extra/VisitViewFollowCountResource';

import Cart from './types/auxilliary/Cart';
import LocalNotification, { LocalNotificationResource } from './types/auxilliary/LocalNotification';
import Input from './types/auxilliary/Input';
import SDate from './types/auxilliary/SDate';
import SDateTime from './types/auxilliary/SDateTime';

import Address, { AddressResource } from './types/element/Address';
import ConnectInstance, { ConnectInstanceResource } from './types/element/ConnectInstance';
import CustomerServiceChat, { CustomerServiceChatResource } from './types/element/CustomerServiceChat';
import CustomerServiceChatMessage, { CustomerServiceChatMessageResource } from './types/element/CustomerServiceChatMessage';
import SEvent, { EventResource } from './types/element/Event';
import Image, { ImageResource } from './types/element/Image';
import LogItem, { LogItemResource } from './types/element/LogItem';
import EntityNotification, { EntityNotificationResource } from './types/element/EntityNotification';
import EntityPreference, { EntityPreferenceResource } from './types/element/EntityPreference';
import Order, { OrderResource } from './types/element/Order';
import Permission, { PermissionResource } from './types/element/Permission';
import Phone, { PhoneResource } from './types/element/Phone';
import Pin, { PinResource } from './types/element/Pin';
import Product, { ProductResource } from './types/element/Product';
import ProductCategory, { ProductCategoryResource } from './types/element/ProductCategory';
import ProductVariation, { ProductVariationResource } from './types/element/ProductVariation';
import Review, { ReviewResource } from './types/element/Review';
import SearchTerm, { SearchTermResource } from './types/element/SearchTerm';
import SocialLink, { SocialLinkResource } from './types/element/SocialLink';

import Admin, { AdminResource } from './types/entity/Admin';
import Store, { StoreResource } from './types/entity/Store';
import User, { UserResource } from './types/entity/User';

import FollowInstance, { FollowInstanceResource } from './types/relation/FollowInstance';
import DiscountInstance, { DiscountInstanceResource } from './types/relation/DiscountInstance';
import PermissionInstance, { PermissionInstanceResource } from './types/relation/PermissionInstance';

import { connectivityBoot } from './actions/web-API.actions';
import { flashMessage } from './actions/flash-message.actions';

import { API_URL, WEB_URL } from './config/axios.config'

import { images_update_object_params, variations_update_object_params } from './utils/special-update-object-params';

export {
    images_update_object_params, variations_update_object_params,
    API_URL, WEB_URL,
    connectivityBoot, flashMessage,
    EntityDisplayCardResource, HostResource, VisitViewFollowCountResource,
    Cart, LocalNotification, LocalNotificationResource, Input, SDate, SDateTime,
    Address, ConnectInstance, SEvent, Image, LogItem, EntityNotification, Order, Permission, Phone, Pin, Product, ProductCategory, ProductVariation, Review, SearchTerm, SocialLink,
    AddressResource, ConnectInstanceResource, EventResource, ImageResource, LogItemResource, EntityNotificationResource, OrderResource, PermissionResource, PhoneResource, PinResource, ProductResource, ProductCategoryResource, ProductVariationResource, ReviewResource, SearchTermResource, SocialLinkResource,
    Admin, Store, User,
    AdminResource, StoreResource, UserResource,
    DiscountInstance, FollowInstance, PermissionInstance,
    DiscountInstanceResource, FollowInstanceResource, PermissionInstanceResource,
}