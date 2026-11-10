/*
 * Copyright (c) 2026 Digital Bazaar, Inc. All rights reserved.
 */

// Verification relationships that hold verification methods or DID URLs.
const RELATIONSHIPS = [
  'authentication', 'assertionMethod', 'keyAgreement',
  'capabilityInvocation', 'capabilityDelegation'
];

// A relative DID URL starts with a fragment, a path, or a query. Absolute DID
// URLs start with "did:".
function isRelative(value) {
  return typeof value === 'string' && /^[#/?]/.test(value);
}

// Expands relative DID URLs in the services, verification methods, and
// verification relationships of a DID document, following the rules in DID
// Core for relative DID URLs. Returns a new document; the input is unchanged.
export function expandRelativeUrls(didDocument, did) {
  const expand = value => isRelative(value) ? did + value : value;
  const expandEntry = entry => {
    if(entry && typeof entry === 'object' && isRelative(entry.id)) {
      return {...entry, id: expand(entry.id)};
    }
    return entry;
  };

  const doc = structuredClone(didDocument);
  if(Array.isArray(doc.service)) {
    doc.service = doc.service.map(expandEntry);
  }
  if(Array.isArray(doc.verificationMethod)) {
    doc.verificationMethod = doc.verificationMethod.map(expandEntry);
  }
  for(const relationship of RELATIONSHIPS) {
    if(Array.isArray(doc[relationship])) {
      doc[relationship] = doc[relationship].map(entry =>
        typeof entry === 'string' ? expand(entry) : expandEntry(entry));
    }
  }
  return doc;
}
