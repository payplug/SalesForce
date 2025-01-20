# PayPlug Integration Module for SFCC (SFRA)

## Description

This module integrates **PayPlug** with Salesforce Commerce Cloud (SFRA) to provide secure and versatile payment options for your storefront. It supports multiple payment methods, flexible checkout flows.

---

## Features

- **Payment Methods Supported:**
  - Credit Cards
  - Oney
  - Wallets
  - AMEX
  - iDEAL
  - Bancontact
  - Satispay
  - Apple Pay

- **Checkout Flows:**
  - **Redirection:** Redirect users to PayPlug's hosted payment page.
  - **Lightbox:** Display the payment interface as a popup overlay.
  - **Integrated:** Embed the payment form directly in your checkout page.

- **Order Status Management:**
  - Orders are marked as **PAID** if the payment is authorized or successfully completed.

---

## Installation

### Prerequisites

1. **Salesforce Commerce Cloud (SFCC)**:
   - Storefront Reference Architecture (SFRA).
   - Access to the Business Manager.

2. **PayPlug Credentials:**
   - API Key and necessary environment configuration provided by PayPlug.

3. **Custom Preferences Group:**
   - Site preferences for PayPlug (details below).

### Steps

1. **Add the Module to Your Project:**
   - Import the module into your SFCC instance under `int_payplug | bm_payplug`.

2. **Update Your Cartridge Path:**
   - Add the PayPlug module to your `Cartridge Path` in **Business Manager**:
     ```
     int_payplug:bm_playplug:your_project
     ```

3. **Configure PayPlug Preferences:**
   - Go to `Administration > Sites > Preferences > Custom Preferences`.
   - Locate the `PayPlug` group and configure the following fields:
     - `PayPlug API Key` : Your API key provided by PayPlug.

4. **Deploy and Test:**
   - Deploy the changes and recompile the site.
   - Test payment flows in sandbox mode before switching to production.

---

## Impacted Pages

- **Checkout Page:**
  - The PayPlug payment options are integrated into the payment step of the checkout process.

---

## Technical Details

- **Cartridge Name:** `int_payplug & bm_payplug`
- **Custom Preferences:**
  - `PP_secretKey` : API key for authentication.
  - `PP_differedPayment` : Boolean for differed Payment.
  - `PP_libraryUrl` : URL for payplug library.
  - `PP_libraryIntegratedUrl` : URL for payplug Library Integrated payment.
  - `PP_force3DS` : Boolean for forcing 3DS.
  - `PP_integrationMode` : Selection of integration mode.
  - `PP_oneClickPayment` : Boolean for one click payment.
  - `PP_oneyDisplay` : Selection of Oney display.
  - `PP_ApplePayDomainCertificate` : Apple Pay certificate.
  - `PP_ApplePayDomain` : Apple Pay Domain.

- **Payment Status Handling:**
  - **PAID:** When the payment is successfully authorized or completed.
---

## Logging and Debugging
.
- Errors are recorded in the **System Logs** in Business Manager for debugging.

---

## Compatibility

- **SFRA Versions:** Compatible with SFRA 6.x and above.
- **Environments:** Sandbox and Production.
- **Supported Browsers:**
  - Chrome, Firefox, Edge, Safari.

---

## Testing

### Recommended Scenarios:
1. **Redirection Flow:**
   - Verify successful redirection to PayPlug's hosted payment page.
   - Test status updates (success, failure, cancellation).

2. **Lightbox Flow:**
   - Ensure the lightbox displays correctly on all devices.
   - Verify successful payment and order status updates.

3. **Integrated Flow:**
   - Test embedded forms for smooth UX and error handling.

---

## Contributors

- **Louis CREMERS** : Lead Developer.

---
