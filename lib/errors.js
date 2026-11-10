/*
 * Copyright (c) 2026 Digital Bazaar, Inc. All rights reserved.
 */

// Error types from Section 8 of DID Resolution v1.0.
export const INVALID_DID = 'https://www.w3.org/ns/did#INVALID_DID';
export const INVALID_DID_URL = 'https://www.w3.org/ns/did#INVALID_DID_URL';
export const INVALID_DID_DOCUMENT =
  'https://www.w3.org/ns/did#INVALID_DID_DOCUMENT';
export const INVALID_OPTIONS = 'https://www.w3.org/ns/did#INVALID_OPTIONS';
export const FEATURE_NOT_SUPPORTED =
  'https://www.w3.org/ns/did#FEATURE_NOT_SUPPORTED';
export const METHOD_NOT_SUPPORTED =
  'https://www.w3.org/ns/did#METHOD_NOT_SUPPORTED';
export const NOT_FOUND = 'https://www.w3.org/ns/did#NOT_FOUND';
export const REPRESENTATION_NOT_SUPPORTED =
  'https://www.w3.org/ns/did#REPRESENTATION_NOT_SUPPORTED';
export const INTERNAL_ERROR = 'https://www.w3.org/ns/did#INTERNAL_ERROR';

// An error with a DID Resolution error type. Drivers throw it to report a
// known failure, such as NOT_FOUND.
export class DIDResolutionError extends Error {
  constructor({type, message = type}) {
    super(message);
    this.name = 'DIDResolutionError';
    this.type = type;
  }
}
