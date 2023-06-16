export class HtmlHelper {
  public static loadingSpinner =
    '<div class="loading-container"><div class="lds-default"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div><h4>Generating NPC...</h4></div>';

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
}
