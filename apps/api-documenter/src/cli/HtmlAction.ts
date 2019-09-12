// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.

import { ApiDocumenterCommandLine } from './ApiDocumenterCommandLine';
import { BaseAction } from './BaseAction';
import { HtmlDocumenter } from '../documenters/HtmlDocumenter';
import { ApiModel } from '@microsoft/api-extractor-model';

export class HtmlAction extends BaseAction {
  constructor(parser: ApiDocumenterCommandLine) {
    super({
      actionName: 'html',
      summary: 'Generate documentation as HTML files (*.html)',
      documentation: 'Generates API documentation as a collection of files in'
        + ' HTML format, suitable for a static website.'
    });
  }

  protected onExecute(): Promise<void> { // override
    const apiModel: ApiModel = this.buildApiModel();

    const markdownDocumenter: HtmlDocumenter = new HtmlDocumenter(apiModel, undefined);
    markdownDocumenter.generateFiles(this.outputFolder);
    return Promise.resolve();
  }
}
