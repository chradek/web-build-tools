// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.

import * as path from 'path';

import {
  PackageName,
  FileSystem,
  NewlineKind
} from '@microsoft/node-core-library';
import {
  DocSection,
  DocPlainText,
  DocLinkTag,
  TSDocConfiguration,
  StringBuilder,
  DocNodeKind,
  DocParagraph,
  DocCodeSpan,
  DocFencedCode,
  StandardTags,
  DocBlock,
  DocComment
} from '@microsoft/tsdoc';
import {
  ApiModel,
  ApiItem,
  ApiEnum,
  ApiPackage,
  ApiItemKind,
  ApiReleaseTagMixin,
  ApiDocumentedItem,
  ApiClass,
  ReleaseTag,
  ApiStaticMixin,
  ApiPropertyItem,
  ApiInterface,
  Excerpt,
  ApiParameterListMixin,
  ApiReturnTypeMixin,
  ApiDeclaredItem,
  ApiNamespace
} from '@microsoft/api-extractor-model';
import {
  DeclarationReference,
  Navigation,
  Meaning
} from '@microsoft/tsdoc/lib/beta/DeclarationReference';

import { Utilities } from '../utils/Utilities';
import { CustomMarkdownEmitter } from '../markdown/CustomMarkdownEmitter';


/**
 * Renders API documentation in the HTML file format.
 */
export class HtmlDocumenter {
  private readonly _apiModel: ApiModel;
  private readonly _markdownEmitter: CustomMarkdownEmitter;
  private _outputFolder: string;
  private _apiItemsByCanonicalReference: Map<string, ApiItem>;

  public constructor(apiModel: ApiModel) {
    this._apiModel = apiModel;
    this._markdownEmitter = new CustomMarkdownEmitter(this._apiModel);
  }

  public generateFiles(outputFolder: string): void {
    this._outputFolder = outputFolder;

    console.log();
    this._deleteOldOutputFiles();

  }

  private _getFilenameForApiItem(apiItem: ApiItem): string {
    if (apiItem.kind === ApiItemKind.Model) {
      return 'index.html';
    }

    let baseName: string = '';
    for (const hierarchyItem of apiItem.getHierarchy()) {
      // For overloaded methods, add a suffix such as "MyClass.myMethod_2".
      let qualifiedName: string = Utilities.getSafeFilenameForName(hierarchyItem.displayName);
      if (ApiParameterListMixin.isBaseClassOf(hierarchyItem)) {
        if (hierarchyItem.overloadIndex > 1) {
          // Subtract one for compatibility with earlier releases of API Documenter.
          // (This will get revamped when we fix GitHub issue #1308)
          qualifiedName += `_${hierarchyItem.overloadIndex - 1}`;
        }
      }

      switch (hierarchyItem.kind) {
        case ApiItemKind.Model:
        case ApiItemKind.EntryPoint:
          break;
        case ApiItemKind.Package:
          baseName = Utilities.getSafeFilenameForName(PackageName.getUnscopedName(hierarchyItem.displayName));
          break;
        default:
          baseName += '.' + qualifiedName;
      }
    }
    return baseName + '.html';
  }

  private _getLinkFilenameForApiItem(apiItem: ApiItem): string {
    return './' + this._getFilenameForApiItem(apiItem);
  }

  private _deleteOldOutputFiles(): void {
    console.log('Deleting old output from ' + this._outputFolder);
    FileSystem.ensureEmptyFolder(this._outputFolder);
  }
}
