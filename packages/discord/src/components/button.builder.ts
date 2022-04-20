import { randomUUID } from 'node:crypto';
import {
  APIButtonComponent,
  APIButtonComponentWithCustomId,
  APIButtonComponentWithURL,
  ButtonStyle,
  ComponentType,
} from 'discord-api-types/v10';

export class ButtonBuilder {
  protected data: APIButtonComponent;

  public constructor() {
    this.data = {
      type: ComponentType.Button,
      style: ButtonStyle.Primary,
      custom_id: randomUUID(),
      disabled: false,
    };
  }

  public label(label: string): this {
    this.data.label = label;
    return this;
  }

  public style(style: ButtonStyle): this {
    this.data.style = style;
    return this;
  }

  public customId(customId: string): this {
    (this.data as APIButtonComponentWithCustomId).custom_id = customId;
    return this;
  }

  public url(url: string): this {
    (this.data as APIButtonComponentWithURL).url = url;
    return this;
  }

  public disable(disabled?: boolean): this {
    this.data.disabled = disabled === undefined ? true : disabled;

    return this;
  }

  public build(): APIButtonComponent {
    return this.data;
  }
}
