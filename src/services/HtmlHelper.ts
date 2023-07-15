import { GeneratedImageData } from '../types/GeneratedImageData';

export class HtmlHelper {
  public static loadingSpinner =
    '<div class="lds-default"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>';

  public static genericErrorMessage =
    '<h3>An error occured, please try again</h3>';

  public static parseHtmlFromValue(
    value: any,
    classPrefix = '',
    indent = false,
  ): string {
    if (Array.isArray(value))
      return value
        .map((v) => HtmlHelper.parseHtmlFromValue(v, classPrefix))
        .join(', ');
    if (typeof value === 'object')
      return Object.entries(value)
        .map(([key, value]) => {
          var className = indent
            ? `${classPrefix}-${key} aga-object-indent`
            : `${classPrefix}-${key}`;

          return `<div class="${className}"><strong>${HtmlHelper.capitalizeString(
            key,
          )}</strong>: ${HtmlHelper.parseHtmlFromValue(
            value,
            classPrefix,
            true,
          )}</div>`;
        })
        .join('');

    return value;
  }

  public static renderLoadingSpinner(selector: string, message: string) {
    HtmlHelper.renderHtmlToSelector(
      `<div class="aga-loading-container">${HtmlHelper.loadingSpinner}<h4>${message}</h4></div>`,
      selector,
    );
  }

  public static capitalizeString(str: string): string {
    return str[0].toUpperCase() + str.slice(1);
  }

  public static renderHtmlToSelector(html: string, selector: string) {
    $(selector).html(html);
  }

  public static renderTextToSelector(text: string, selector: string) {
    $(selector).text(text);
  }

  public static appendHtmlToSelector(html: string, selector: string) {
    $(selector).append(html);
  }

  public static prependHtmlToSelector(html: string, selector: string) {
    $(selector).prepend(html);
  }

  public static getInput(selector: string): string {
    return $(selector).val() as string;
  }

  public static setDisabled(selector: string, disabled: boolean) {
    $(selector).prop('disabled', disabled);
  }

  public static createInfoIcon(title: string): string {
    return `<i class="fa-solid fa-circle-info" title="${title}"></i>`;
  }

  public static createSaveIconBtn(
    className: string,
    htmlProperties: string,
  ): string {
    return `<button type="button" class="${className}" ${htmlProperties} title="Save this image - if selected when you create an NPC, it will be saved automatically"><i class='fa-solid fa-lg fa-floppy-disk'></i></button>`;
  }

  public static createImagesFromUrls(
    urls: string[],
    altText: string = 'image',
    className: string = 'aga-image',
  ): string[] {
    return urls.map(
      (url, i) =>
        `<div class="aga-single-image-selector" data-imageid="${i}"><img src="${url}" alt="${altText}${i}" class="${className}" /></div>`,
    );
  }

  public static createImagesFromBase64(
    data: GeneratedImageData[],
    altText: string = 'image',
    className: string = 'aga-image',
  ): string[] {
    return data.map(
      (image, i) =>
        `<div class="aga-image-selector" data-imageid="${i}"><img src="${image.url}" alt="${altText}${i}" class="${className}" /></div>`,
    );
  }
}
