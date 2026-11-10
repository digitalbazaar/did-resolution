/*
 * Copyright (c) 2026 Digital Bazaar, Inc. All rights reserved.
 */

import {
  DIDResolutionError, INTERNAL_ERROR, INVALID_DID, INVALID_DID_DOCUMENT,
  METHOD_NOT_SUPPORTED
} from './errors.js';
import {isValidDid, parseDid} from './syntax.js';
import {validateOptions} from './options.js';

// Media types for a DID document representation.
const DOCUMENT_TYPES = ['application/did+ld+json', 'application/did+json'];
const DEFAULT_CONTENT_TYPE = 'application/did+ld+json';

// The DID resolution function (Section 4.1 and the algorithm in Section 4.2).
// Never throws: every outcome is a result, as the specification requires.
//
// methods: a map from DID method name to a driver. A driver has
//   resolve(did, resolutionOptions), which returns
//   {didDocument, didDocumentMetadata}, or throws a DIDResolutionError.
//   A driver reports NOT_FOUND by throwing DIDResolutionError.
//
// Returns {didResolutionMetadata, didDocument, didDocumentMetadata}.
export async function resolve(
  did, {resolutionOptions = {}, methods = {}} = {}) {
  try {
    if(!isValidDid(did)) {
      return errorResult(INVALID_DID);
    }
    const {method} = parseDid(did);
    if(!Object.hasOwn(methods, method)) {
      return errorResult(METHOD_NOT_SUPPORTED);
    }
    validateOptions(resolutionOptions);

    let output;
    try {
      output = await methods[method].resolve(did, resolutionOptions);
    } catch(error) {
      if(error instanceof DIDResolutionError) {
        return errorResult(error.type);
      }
      throw error;
    }
    const {didDocument, didDocumentMetadata = {}} = output ?? {};
    const contentType = contentTypeFor(resolutionOptions.accept);

    // A deactivated DID has no document, but its metadata says so.
    if(didDocumentMetadata.deactivated === true) {
      return {
        didResolutionMetadata: {contentType},
        didDocument: null,
        didDocumentMetadata: {...didDocumentMetadata}
      };
    }
    if(!didDocument || typeof didDocument !== 'object' ||
      didDocument.id !== did) {
      return errorResult(INVALID_DID_DOCUMENT);
    }
    return {
      didResolutionMetadata: {contentType},
      didDocument,
      didDocumentMetadata: {...didDocumentMetadata}
    };
  } catch(error) {
    if(error instanceof DIDResolutionError) {
      return errorResult(error.type);
    }
    return errorResult(INTERNAL_ERROR);
  }
}

// An unsuccessful result: an error in the metadata, a null document, and
// empty document metadata.
function errorResult(type) {
  return {
    didResolutionMetadata: {error: {type}},
    didDocument: null,
    didDocumentMetadata: {}
  };
}

// The Accept value is used when it names a DID document representation. Other
// values fall back to the default. The spec says a resolver SHOULD use the
// value when it can.
function contentTypeFor(accept) {
  return DOCUMENT_TYPES.includes(accept) ? accept : DEFAULT_CONTENT_TYPE;
}
