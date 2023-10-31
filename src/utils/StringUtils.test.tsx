import StringUtils from "./StringUtils";

describe("StringUtils Functions", () => {
    it("Should combine string", () => {
        const baseString = "This is some ";
        const suffixString = "is some text";
        const combinedString = StringUtils.combineStrings(
            baseString,
            suffixString
        );
        expect(combinedString).toBe("This is some text");
    });

    it("Should combine string with different casing", () => {
        const baseString = "This is some ";
        const suffixString = "This is SOME text";
        const combinedString = StringUtils.combineStrings(
            baseString,
            suffixString
        );
        expect(combinedString).toBe("This is SOME text");
    });

    it("Should combine string with no overlap", () => {
        const baseString = "This is some ";
        const suffixString = "text";
        const combinedString = StringUtils.combineStrings(
            baseString,
            suffixString
        );
        expect(combinedString).toBe("This is some text");
    });

    it("Should split a string on the last occurrence of a pattern", () => {
        const str = "This is some text";
        const pattern = "is";
        const splitString = StringUtils.splitOnLastIndexOf(str, pattern);
        expect(splitString).toEqual(["This is", " some text"]);
    });
});
