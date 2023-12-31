/* tslint:disable */
/* eslint-disable */
/**
 * Zete
 * 메모 서비스
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
import { Tag } from './tag';

/**
 * 
 * @export
 * @interface UpdateMemoInput
 */
export interface UpdateMemoInput {
    /**
     * 
     * @type {number}
     * @memberof UpdateMemoInput
     */
    'id': number;
    /**
     * 
     * @type {string}
     * @memberof UpdateMemoInput
     */
    'title'?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateMemoInput
     */
    'content'?: string;
    /**
     * 
     * @type {boolean}
     * @memberof UpdateMemoInput
     */
    'isImportant'?: boolean;
    /**
     * 
     * @type {number}
     * @memberof UpdateMemoInput
     */
    'cateId'?: number;
    /**
     * 
     * @type {Array<Tag>}
     * @memberof UpdateMemoInput
     */
    'tags'?: Array<Tag>;
}

