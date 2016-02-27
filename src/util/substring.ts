"use strict";

/**
 * A reference to a substring
 * @author Michel Kraemer
 */
class SubString {
  /**
   * Construct the substring
   * @param str the original string
   * @param start the location in the original string where the substring should start
   * @param end the location of the first character in the original string that
   * should not be included in the substring
   */
  constructor(private str: string, private start: number, private end?: number) {
  }

  /**
   * @return the actual substring
   */
  save(): string {
    return this.str.substring(this.start, this.end);
  }

  /**
   * @return the substring's length
   */
  get length() {
    return this.end - this.start;
  }

  /**
   * @return the actual substring
   */
  toString(): string {
    return this.save();
  }
}

export default SubString;
