export default class StringUtils {
    static splitOnLastIndexOf = (str: string, pattern: string): string[] => {
        const lastOccurrence: number = str.lastIndexOf(pattern);

        if (lastOccurrence === -1) {
            // The pattern doesn't exist in the string
            return [str];
        }

        // Split the string based on the last occurrence of the pattern
        const firstPart: string = str.substring(
            0,
            lastOccurrence + pattern.length
        );
        const secondPart: string = str.substring(
            lastOccurrence + pattern.length
        );

        return [firstPart, secondPart];
    };

    static combineStrings = (
        baseString: string,
        suffixString: string
    ): string => {
        // Quick check: If suffixString starts with baseString, return suffixString
        if (suffixString.toLowerCase().startsWith(baseString.toLowerCase())) {
            return suffixString;
        }

        // Find the largest suffix of baseString that's also a prefix of suffixString
        for (let i = 0; i < baseString.length; i++) {
            const suffix = baseString.substring(i);
            if (suffixString.toLowerCase().startsWith(suffix.toLowerCase())) {
                // Return the concatenation of baseString and the remaining part of suffixString
                return baseString + suffixString.slice(suffix.length);
            }
        }

        // If there's no overlapping part, simply concatenate baseString and suffixString
        return baseString + suffixString;
    };
}
