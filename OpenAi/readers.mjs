import fs from "fs/promises";
import { XMLParser } from "fast-xml-parser";

export const TxtReader = {
    canHandle: (file) => file.endsWith(".txt"),
    read: async (file) => {
        return await fs.readFile(file, "utf8");
    }
};

export const XmlReader = {
    canHandle: (file) => file.endsWith(".xml"),
    read: async (file) => {
        const xmlContent = await fs.readFile(file, "utf8");
        const docs = new XMLParser().parse(xmlContent).KnowledgeBase?.Document || [];

        return [docs].flat().map(({ Title = "", Content = "" }) => `${Title}\n${Content}`).join("\n\n---\n\n");
    }
};

export const Readers = [TxtReader, XmlReader];
