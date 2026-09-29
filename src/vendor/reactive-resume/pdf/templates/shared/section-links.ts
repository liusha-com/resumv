import type { Website } from "@reactive-resume/schema/resume/data";

type ItemWebsite = Website & {
	inlineLink?: boolean | undefined;
};

export const getInlineItemWebsiteUrl = (website: ItemWebsite): string | undefined => {
	if (!website.url || !website.inlineLink) return undefined;

	return website.url;
};

export const shouldRenderSeparateItemWebsite = (website: ItemWebsite): boolean => {
	return Boolean(website.url && !website.inlineLink);
};
