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



/**
 * 
 * @export
 * @interface AccessTokenOutput
 */
export interface AccessTokenOutput {
    /**
     * 
     * @type {string}
     * @memberof AccessTokenOutput
     */
    'error'?: string;
    /**
     * 
     * @type {string}
     * @memberof AccessTokenOutput
     */
    'target'?: string;
    /**
     * 
     * @type {string}
     * @memberof AccessTokenOutput
     */
    'message'?: string;
    /**
     * 
     * @type {boolean}
     * @memberof AccessTokenOutput
     */
    'success': boolean;
    /**
     * 
     * @type {string}
     * @memberof AccessTokenOutput
     */
    'accessToken'?: string | null;
}

