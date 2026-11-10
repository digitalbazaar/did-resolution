/*
 * Copyright (c) 2026 Digital Bazaar, Inc. All rights reserved.
 */

// DID syntax from DID Core: did = "did:" method-name ":" method-specific-id.
// method-name is lowercase letters and digits. method-specific-id is made of
// ALPHA, DIGIT, ".", "-", "_", percent-encoded octets, and ":" separators, and
// does not start or end with ":".
const DID = new RegExp(
  '^did:[a-z0-9]+:' +
  '(?:(?:[a-zA-Z0-9.\\-_]|%[0-9a-fA-F]{2})*:)*' +
  '(?:[a-zA-Z0-9.\\-_]|%[0-9a-fA-F]{2})+$');

export function isValidDid(did) {
  return typeof did === 'string' && DID.test(did);
}

// Splits a valid DID into its method name and method-specific identifier.
export function parseDid(did) {
  const [, method, ...rest] = did.split(':');
  return {method, methodSpecificId: rest.join(':')};
}
