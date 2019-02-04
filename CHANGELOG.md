# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

<!--
   PRs should document their user-visible changes (if any) in the
   Unreleased section, uncommenting the header as necessary.
-->
<!-- ### Added -->
<!-- ### Changed -->
<!-- ### Removed -->
<!-- ### Fixed -->

## [4.0.0] - 2019-01-29 [Breaking]
### Added
* Typescript definitions located in *.d.ts files
* Rewrite component to LitElement
### Changed
* `[Breaking]` Two way data binding has been removed. To obtain `selected` value 2 handlers should be added:
  * event `exmg-combobox-select` where event.detail is equal to `EventSelectPayload`
  ```typescript
    export type EventSelectPayload = {
      value: number | string;
      item: Element;
      token: Token;
    };
    
    export type Token = {
        id: number | string;
        text: string;
    };
  ```
  * event `exmg-combobox-delect`
  * example for lit-element
  ```html
  <exmg-paper-combobox
    @exmg-combobox-select="${handler}"
    @exmg-combobox-deselect="${handler}"
  >
  </exmg-paper-combobox>
  ```
    * example for polymer
    ```html
    <exmg-paper-combobox
      on-exmg-combobox-select="_handler"
      on-exmg-combobox-deselect="_handler"
    >
    </exmg-paper-combobox>
    ```
