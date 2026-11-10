/*
 * Copyright (c) 2026 Digital Bazaar, Inc. All rights reserved.
 */

import {
  DIDResolutionError, FEATURE_NOT_SUPPORTED, INVALID_OPTIONS
} from './errors.js';

// Common resolution options defined in Section 2.4 of DID Resolution v1.0.
// Other option names are not supported by this library.
const TYPES = {
  accept: 'string',
  expandRelativeUrls: 'boolean',
  versionId: 'string',
  versionTime: 'string'
};

// Throws DIDResolutionError: FEATURE_NOT_SUPPORTED for an option this library
// does not implement, and INVALID_OPTIONS for a value of the wrong type.
export function validateOptions(options) {
  const isObject = options !== null && typeof options === 'object' &&
    !Array.isArray(options);
  if(!isObject) {
    throw new DIDResolutionError({
      type: INVALID_OPTIONS, message: 'Resolution options must be an object.'
    });
  }
  for(const [name, value] of Object.entries(options)) {
    if(!Object.hasOwn(TYPES, name)) {
      throw new DIDResolutionError({
        type: FEATURE_NOT_SUPPORTED,
        message: `Resolution option "${name}" is not supported.`
      });
    }
    if(typeof value !== TYPES[name]) {
      throw new DIDResolutionError({
        type: INVALID_OPTIONS,
        message: `Resolution option "${name}" must be a ${TYPES[name]}.`
      });
    }
  }
  if(options.versionTime !== undefined &&
    Number.isNaN(Date.parse(options.versionTime))) {
    throw new DIDResolutionError({
      type: INVALID_OPTIONS,
      message: 'versionTime must be an XML Schema dateTime.'
    });
  }
}
