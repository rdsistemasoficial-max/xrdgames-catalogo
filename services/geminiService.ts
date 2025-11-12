import { GoogleGenAI, Type } from "@google/genai";
import { Game, GameCategory } from '../types';

export const fetchGameDetailsFromUrl = async (xboxStoreUrl: string): Promise<Partial<Game>> => {
    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set.");
        return {
            name: "Jogo Exemplo (API Key Ausente)",
            description: "Chave de API não configurada. Usando dados de exemplo.",
            category: "Aventura" as GameCategory,
            official_price: 999.99,
            cover_art: 'https://via.placeholder.com/300x400.png?text=API+Key+Ausente'
        };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `Analise a página da Xbox Store a partir da URL: "${xboxStoreUrl}" e extraia as seguintes informações como um objeto JSON:
1.  "name": O nome oficial e completo do jogo.
2.  "description": Um resumo curto e atraente com no máximo 150 caracteres.
3.  "category": A categoria mais apropriada entre: 'Ação', 'Corrida', 'Esportes', 'RPG', 'Aventura', 'Estratégia'.
4.  "official_price": O preço oficial do jogo em BRL. Siga estas regras ESTRITAS: 
    a. PRIORIZE o preço cheio/original (geralmente riscado se houver uma promoção).
    b. IGNORE COMPLETAMENTE qualquer preço associado a "Game Pass" ou assinaturas.
    c. Se o jogo for "Grátis", o valor deve ser 0.
    d. Se o preço não estiver disponível, retorne 0.
    e. Extraia apenas o número, sem "R$" ou vírgulas (ex: 189.90).
5.  "cover_art": A URL pública e direta da imagem de capa (box art) oficial. A imagem deve ser de alta qualidade. Se não encontrar, use esta URL: 'https://via.placeholder.com/300x400.png?text=Capa+Indisponivel'.

Retorne APENAS o objeto JSON bruto, sem markdown.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: "Nome oficial completo do jogo." },
                        description: { type: Type.STRING, description: "Breve descrição do jogo." },
                        category: { type: Type.STRING, enum: ['Ação', 'Corrida', 'Esportes', 'RPG', 'Aventura', 'Estratégia'], description: "Categoria do jogo." },
                        official_price: { type: Type.NUMBER, description: "Preço oficial do jogo como um número." },
                        cover_art: { type: Type.STRING, description: "URL da imagem de capa oficial do jogo." }
                    },
                    required: ["name", "description", "category", "official_price", "cover_art"]
                }
            }
        });
        
        const text = response.text.trim();
        const parsedJson = JSON.parse(text);
        return parsedJson as Partial<Game>;
    } catch (error) {
        console.error("Erro ao buscar detalhes do jogo no Gemini:", error);
        return {
            name: "Erro ao Buscar",
            description: "Não foi possível carregar os detalhes via IA. Verifique a URL e tente novamente.",
            category: "Aventura" as GameCategory,
            official_price: 0,
            cover_art: 'https://via.placeholder.com/300x400.png?text=Erro+na+Busca'
        };
    }
};