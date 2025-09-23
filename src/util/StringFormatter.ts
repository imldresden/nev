import { TableNodeData, TreeNodeData } from "../data/TreeNodeData";

export class StringFormatter {
  private static instance: StringFormatter;
  public static maxLength: number = Infinity;
  public static maxLengthSlider: number = -1;
  private constructor() { }

  public static getInstance(): StringFormatter {
    if (!StringFormatter.instance) {
      StringFormatter.instance = new StringFormatter();
    }
    return StringFormatter.instance;
  }

  private truncate(str: string, maxLen: number): string {
    return str.length > maxLen ? str.slice(0, maxLen) + "…" : str;
  }

  public needsTruncation(str: string): boolean {
    return str.length > StringFormatter.maxLength;
  }

  public needsRuleTruncation(str: string): boolean {
    let truncated = false;
    str.replace(/([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)/g, (match, name) => {
      if (name.length > StringFormatter.maxLength) {
        truncated = true;
      }
      return match;
    });
    return truncated;
  }

  public resetMaxLengthSlider(data: TreeNodeData) {
      StringFormatter.maxLengthSlider = -1;
      StringFormatter.getInstance().setMaxLengthSlider(data);
  }

  public setMaxLengthSlider(data: TreeNodeData) {
    if (data.getName().length > StringFormatter.maxLengthSlider && data instanceof TableNodeData) {
      StringFormatter.maxLengthSlider = data.getName().length;
    }
    for (const child of data.getChildren()) {
        this.setMaxLengthSlider(child);
    }
  }

  public formatPredicate(name: string, shortenName: boolean, parameter?: string[]): string {
    const truncatedName = shortenName ? this.truncate(name, StringFormatter.maxLength) : name;
    const params = Array.isArray(parameter) ? parameter.join(", ") : "";
    return `${truncatedName}(${params})`;
  }

  public formatFact(fact: string, shortenName: boolean): string {
    return shortenName ? this.truncate(fact, StringFormatter.maxLength) : fact;
  }

  public formatRuleName(name: string, shortenName: boolean): string {
    // Regex: PredicateName(args)
    return name.replace(/([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)/g, (_match, name, args) => {
      const truncatedName = shortenName ? this.truncate(name, StringFormatter.maxLength) : name;
      return `${truncatedName}(${args})`;
    });
  }
}

export default StringFormatter.getInstance();
