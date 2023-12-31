/* tslint:disable */
/* eslint-disable */
/**
 * Cats example
 * The cats API description
 *
 * The version of the OpenAPI document: v1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


// May contain unused imports in some cases
// @ts-ignore
import { CategoriesAndMemoCount } from './categories-and-memo-count';

/**
 * 
 * @export
 * @interface AsideData
 */
export interface AsideData {
    /**
     * 
     * @type {number}
     * @memberof AsideData
     */
    'memosCount'?: number;
    /**
     * 
     * @type {number}
     * @memberof AsideData
     */
    'importantMemoCount'?: number;
    /**
     * 
     * @type {number}
     * @memberof AsideData
     */
    'cateCount'?: number;
    /**
     * 
     * @type {Array<CategoriesAndMemoCount>}
     * @memberof AsideData
     */
    'cate'?: Array<CategoriesAndMemoCount>;
}

