import React, { useState, useEffect, useCallback } from 'react';
import { Game } from './types';
import { fetchGameDetailsFromUrl } from './services/geminiService';
import { supabase } from './services/supabaseClient';

const WHATSAPP_NUMBER = '556191685125';
const ADMIN_PASSWORD = 'admin';

// --- ÍCONES ---
const IconGameController = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>);
const IconSearch = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>);
const IconEdit = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>);
const IconTrash = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const IconPlus = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>);
const IconLogout = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>);
const IconWhatsApp = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.687-1.475L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.655 4.398 1.908 6.166l-1.138 4.155 4.274-1.14z" /></svg>);
const IconInfo = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);


// --- COMPONENTES AUXILIARES ---

interface HeaderProps {
    navigate: (path: string) => void;
    isAdmin: boolean;
    logoUrl: string | null;
}
const Header: React.FC<HeaderProps> = ({ navigate, isAdmin, logoUrl }) => (
    <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-50 shadow-lg shadow-emerald-500/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('#home')}>
                 {logoUrl ? (
                    <img src={logoUrl} alt="Xrdgames Logo" className="h-12 w-auto" />
                 ) : (
                    <span className="text-emerald-400"><IconGameController /></span>
                 )}
                <h1 className="text-2xl font-bold text-white tracking-wider">Xrdgames</h1>
            </div>
            <nav>
                <button
                    onClick={() => navigate(isAdmin ? '#admin' : '#login')}
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-md hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-emerald-500 transition-transform transform hover:scale-105"
                >
                    Painel Admin
                </button>
            </nav>
        </div>
    </header>
);

const InfoTooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
    return (
        <div className="relative flex items-center group">
            {children}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 shadow-lg border border-gray-700">
                {text}
            </div>
        </div>
    );
};

const GameOfferCard: React.FC<{ game: Game }> = ({ game }) => {
    const createWhatsappUrl = (mediaType: string) => {
        const message = `Olá! Tenho interesse no jogo ${game.name} (${mediaType}) que vi no site Xrdgames.`;
        return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden animate-fade-in-up mt-8 max-w-4xl mx-auto border border-gray-700">
            <div className="md:flex">
                <div className="md:flex-shrink-0">
                    <img className="h-full w-full object-cover md:w-64" src={game.cover_art} alt={`Capa de ${game.name}`} />
                </div>
                <div className="p-6 md:p-8 flex flex-col flex-grow">
                    <div>
                        <div className="uppercase tracking-wide text-sm text-emerald-400 font-semibold">{game.category}</div>
                        <h2 className="block mt-1 text-2xl leading-tight font-bold text-white">{game.name}</h2>
                        <p className="mt-2 text-gray-400 text-sm">{game.description}</p>
                    </div>
                    
                    <div className="mt-6 space-y-4">
                        {/* Oferta Mídia Exclusiva */}
                        <div className="bg-gray-900/50 p-4 rounded-lg border border-emerald-500/30">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <h3 className="text-lg font-semibold text-white">Mídia Digital Exclusiva</h3>
                                    <InfoTooltip text="Você recebe uma conta exclusiva para instalar o jogo e joga diretamente no seu perfil principal. Conquistas e saves ficam no seu perfil.">
                                        <IconInfo />
                                    </InfoTooltip>
                                </div>
                                <p className="text-2xl font-bold text-emerald-400">R$ {game.my_price_exclusive.toFixed(2).replace('.', ',')}</p>
                            </div>
                            <a
                                href={createWhatsappUrl('Mídia Digital Exclusiva')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 w-full block text-center px-4 py-2 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-all duration-300 flex items-center justify-center transform hover:scale-105"
                            >
                               <IconWhatsApp /> Comprar via WhatsApp
                            </a>
                        </div>
                        
                        {/* Oferta Mídia Parental */}
                        <div className="bg-gray-900/50 p-4 rounded-lg border border-blue-500/30">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <h3 className="text-lg font-semibold text-white">Mídia Parental (com métodos)</h3>
                                     <InfoTooltip text="Você recebe uma conta para instalar o jogo. É necessário seguir um método específico para jogar. Ideal para quem busca o menor preço.">
                                        <IconInfo />
                                    </InfoTooltip>
                                </div>
                                <p className="text-2xl font-bold text-blue-400">R$ {game.my_price_parental.toFixed(2).replace('.', ',')}</p>
                            </div>
                            <a
                                href={createWhatsappUrl('Mídia Parental com métodos')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 w-full block text-center px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all duration-300 flex items-center justify-center transform hover:scale-105"
                            >
                               <IconWhatsApp /> Comprar via WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MediaInfoCards = () => (
    <div className="mt-12 max-w-4xl mx-auto grid md:grid-cols-2 gap-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
      <div className="bg-gray-800 p-6 rounded-lg border border-emerald-500/30">
        <h3 className="text-xl font-bold text-emerald-400 mb-3">Como funciona a Mídia Exclusiva?</h3>
        <p className="text-gray-300 text-sm">
          Você recebe uma conta nova (login e senha) para instalar o jogo no seu console. Após a instalação, você joga diretamente no seu perfil pessoal, acumulando todas as conquistas e salvando seu progresso na sua própria conta. É como se o jogo fosse seu, de forma permanente e sem restrições.
        </p>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg border border-blue-500/30">
        <h3 className="text-xl font-bold text-blue-400 mb-3">Como funciona a Mídia Parental?</h3>
        <p className="text-gray-300 text-sm">
          Você também recebe uma conta para instalar o jogo. Para jogar, é necessário seguir um método de inicialização simples (que ensinamos passo a passo). Esta opção é mais econômica e perfeita para quem quer aproveitar ao máximo gastando menos.
        </p>
      </div>
    </div>
  );

// --- PÁGINAS ---

interface ClientSearchPageProps {
    catalog: Game[];
    logoUrl: string | null;
}
const ClientSearchPage: React.FC<ClientSearchPageProps> = ({ catalog, logoUrl }) => {
    const [searchUrl, setSearchUrl] = useState('');
    const [searchResult, setSearchResult] = useState<'idle' | 'not_found' | Game>('idle');
    const [isLoading, setIsLoading] = useState(false);
    const [notFoundGameDetails, setNotFoundGameDetails] = useState<Partial<Game> | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setSearchResult('idle');
        setNotFoundGameDetails(null);

        const foundGame = catalog.find(game => game.xbox_store_url.trim() === searchUrl.trim());

        if (foundGame) {
            setSearchResult(foundGame);
        } else {
            const details = await fetchGameDetailsFromUrl(searchUrl);
            setNotFoundGameDetails(details);
            setSearchResult('not_found');
        }
        setIsLoading(false);
    };

    const whatsappQuoteUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        notFoundGameDetails && notFoundGameDetails.name && notFoundGameDetails.name !== "Erro ao Buscar"
            ? `Olá! Busquei pelo jogo ${notFoundGameDetails.name} no site Xrdgames e não encontrei a oferta. Gostaria de solicitar uma cotação personalizada.`
            : 'Olá! Busquei por um jogo no site Xrdgames e não encontrei a oferta. Gostaria de solicitar uma cotação personalizada.'
    )}`;

    return (
        <>
            <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Encontre Sua <span className="text-emerald-400">Próxima Aventura</span></h2>
                <p className="text-lg text-gray-300 max-w-3xl mx-auto">Cole o link oficial da Xbox Store e veja se temos uma oferta especial para você em nosso catálogo.</p>
            </div>

            {logoUrl && (
                <div className="flex justify-center mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <img src={logoUrl} alt="Logotipo da Loja Xrdgames" className="max-h-56 w-auto rounded-lg shadow-lg" />
                </div>
            )}

            <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSearch}>
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                           <IconSearch />
                        </div>
                        <input
                            type="url"
                            placeholder="https://www.xbox.com/pt-BR/games/store/..."
                            value={searchUrl}
                            onChange={(e) => setSearchUrl(e.target.value)}
                            className="w-full bg-gray-800 border-2 border-gray-700 text-white rounded-full py-4 pl-12 pr-32 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                        />
                         <button 
                            type="submit" 
                            className="absolute inset-y-0 right-0 m-1.5 px-6 py-2 text-white bg-emerald-500 rounded-full hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-emerald-500 disabled:bg-gray-500"
                            disabled={isLoading}
                         >
                             {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Buscar Oferta'}
                         </button>
                     </div>
                </form>
            </div>

            <div className="mt-8">
                {searchResult !== 'idle' && searchResult !== 'not_found' && (
                    <>
                        <GameOfferCard game={searchResult as Game} />
                        <MediaInfoCards />
                    </>
                )}
                {searchResult === 'not_found' && (
                    <div className="text-center py-10 max-w-md mx-auto bg-gray-800 rounded-lg p-6 animate-fade-in-up">
                        <p className="text-xl text-yellow-300 font-bold">Oferta não encontrada!</p>
                        {notFoundGameDetails && notFoundGameDetails.name && notFoundGameDetails.name !== "Erro ao Buscar" ? (
                            <p className="text-gray-400 mt-2">
                                Ainda não temos uma oferta para o jogo <strong>{notFoundGameDetails.name}</strong>, mas você pode solicitar uma cotação personalizada no WhatsApp!
                            </p>
                        ) : (
                            <p className="text-gray-400 mt-2">Ainda não temos uma oferta para este jogo em nosso catálogo. Fale conosco no WhatsApp para uma cotação personalizada!</p>
                        )}
                        <a
                            href={whatsappQuoteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-6 inline-flex items-center justify-center px-6 py-2 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-all duration-300 transform hover:scale-105"
                        >
                            <IconWhatsApp /> Solicitar Cotação
                        </a>
                    </div>
                )}
            </div>
        </>
    );
};

interface AdminLoginPageProps { onLogin: (password: string) => void; }
const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLogin }) => {
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(password);
    };

    return (
        <div className="flex items-center justify-center py-12">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center text-white">Acesso Restrito</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-gray-300 block mb-2">Senha</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full px-4 py-2 text-white bg-emerald-500 rounded-md hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-emerald-500">
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
};

interface AdminDashboardProps {
    games: Game[];
    onSave: (gameData: Omit<Game, 'id'>, id?: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onLogout: () => void;
    onLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveLogo: () => void;
    logoUrl: string | null;
}
const AdminDashboard: React.FC<AdminDashboardProps> = ({ games, onSave, onDelete, onLogout, onLogoUpload, onRemoveLogo, logoUrl }) => {
    const [showModal, setShowModal] = useState(false);
    const [editingGame, setEditingGame] = useState<Game | null>(null);

    const handleAddClick = () => {
        setEditingGame(null);
        setShowModal(true);
    };

    const handleEditClick = (game: Game) => {
        setEditingGame(game);
        setShowModal(true);
    };
    
    const handleFormSave = async (gameData: Omit<Game, 'id'>, id?: string) => {
        await onSave(gameData, id);
        setShowModal(false);
    };

    const GameForm: React.FC<{ game: Game | null, onSave: (data: Omit<Game, 'id'>, id?: string) => void, onCancel: () => void }> = ({ game, onSave, onCancel }) => {
        const [formData, setFormData] = useState({
            my_price_exclusive: game?.my_price_exclusive || 0,
            my_price_parental: game?.my_price_parental || 0,
            xbox_store_url: game?.xbox_store_url || '',
            cover_art: game?.cover_art || '',
        });
        const [fetchedData, setFetchedData] = useState<Partial<Game> | null>(game ? { ...game } : null);
        const [isFetching, setIsFetching] = useState(false);
        
        useEffect(() => {
            if (fetchedData?.cover_art) {
                setFormData(prev => ({ ...prev, cover_art: fetchedData.cover_art! }));
            }
        }, [fetchedData]);

        const handleFetchDetails = async () => {
            if (!formData.xbox_store_url || !formData.xbox_store_url.startsWith('http')) {
                alert('Por favor, insira uma URL válida da Xbox Store.');
                return;
            }
            setIsFetching(true);
            const details = await fetchGameDetailsFromUrl(formData.xbox_store_url);
            setFetchedData(details);
            setIsFetching(false);
        };

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (!fetchedData || !fetchedData.name || !fetchedData.description || !fetchedData.category) {
                alert('Por favor, busque os detalhes do jogo a partir da URL antes de salvar.');
                return;
            }
            if (!formData.cover_art) {
                alert('A URL da imagem da capa é obrigatória. Se a busca falhou, por favor, insira manualmente.');
                return;
            }
            if (Number(formData.my_price_exclusive) <= 0 || Number(formData.my_price_parental) <= 0) {
                alert('Por favor, insira preços válidos para ambas as mídias.');
                return;
            }
            const completeGameData: Omit<Game, 'id'> = {
                name: fetchedData.name,
                description: fetchedData.description,
                category: fetchedData.category,
                cover_art: formData.cover_art,
                my_price_exclusive: Number(formData.my_price_exclusive),
                my_price_parental: Number(formData.my_price_parental),
                xbox_store_url: formData.xbox_store_url,
            };
            onSave(completeGameData, game?.id);
        };

        return (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
                <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl relative text-white my-8">
                    <h3 className="text-xl font-bold mb-4">{game ? 'Editar Jogo' : 'Adicionar Jogo ao Catálogo'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-300">1. URL do Jogo na Xbox Store</label>
                            <div className="flex gap-2">
                                <input 
                                    type="url" 
                                    placeholder="https://www.xbox.com/pt-BR/games/store/..."
                                    value={formData.xbox_store_url} 
                                    onChange={e => setFormData({...formData, xbox_store_url: e.target.value})} 
                                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-emerald-500" 
                                    required 
                                />
                                <button 
                                    type="button" 
                                    onClick={handleFetchDetails} 
                                    disabled={isFetching} 
                                    className="px-4 py-2 bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-500 flex items-center justify-center min-w-[100px]"
                                >
                                    {isFetching ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Buscar'}
                                </button>
                            </div>
                        </div>

                        {isFetching && <p className="text-center text-blue-300">Buscando dados... Isso pode levar alguns segundos.</p>}

                        {fetchedData && fetchedData.name !== "Erro ao Buscar" && (
                            <div className="bg-gray-700 p-4 rounded-md space-y-3 border border-emerald-500/50">
                                <h4 className="font-bold text-lg text-emerald-400">Dados Encontrados:</h4>
                                <p><strong>Nome:</strong> {fetchedData.name}</p>
                                
                                 <div>
                                    <label className="block text-sm font-medium text-gray-300 mt-2">2. URL da Imagem da Capa (Verifique ou corrija)</label>
                                    <input 
                                        type="url" 
                                        placeholder="Cole a URL da imagem aqui"
                                        value={formData.cover_art} 
                                        onChange={e => setFormData({...formData, cover_art: e.target.value})} 
                                        className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-emerald-500" 
                                        required 
                                    />
                                     {formData.cover_art && <img src={formData.cover_art} alt="Preview da capa" className="mt-2 rounded w-24 h-32 object-cover" />}
                                </div>
                            </div>
                        )}
                        
                        {fetchedData && fetchedData.name === "Erro ao Buscar" && (
                             <div className="bg-red-900/50 p-3 rounded-md border border-red-500/50">
                                <p className="text-red-300">{fetchedData.description}</p>
                             </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300">3. Preço Mídia Exclusiva (R$)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    placeholder="ex: 149.90"
                                    value={formData.my_price_exclusive} 
                                    onChange={e => setFormData({...formData, my_price_exclusive: Number(e.target.value)})} 
                                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-emerald-500 disabled:bg-gray-600" 
                                    required 
                                    disabled={!fetchedData || fetchedData.name === "Erro ao Buscar"}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">4. Preço Mídia Parental (R$)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    placeholder="ex: 49.90"
                                    value={formData.my_price_parental} 
                                    onChange={e => setFormData({...formData, my_price_parental: Number(e.target.value)})} 
                                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-emerald-500 disabled:bg-gray-600" 
                                    required 
                                    disabled={!fetchedData || fetchedData.name === "Erro ao Buscar"}
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500">Cancelar</button>
                            <button 
                                type="submit" 
                                className="px-4 py-2 bg-emerald-500 rounded-md hover:bg-emerald-600 disabled:bg-emerald-800 disabled:text-gray-400 disabled:cursor-not-allowed" 
                                disabled={isFetching || !fetchedData || fetchedData.name === "Erro ao Buscar"}
                            >
                                Salvar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">Meu Catálogo de Ofertas</h2>
                <div>
                     <button onClick={onLogout} className="text-gray-300 hover:text-white mr-4 p-2 rounded-full hover:bg-gray-700">
                        <IconLogout />
                    </button>
                    <button onClick={handleAddClick} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 rounded-md hover:bg-emerald-600">
                        <IconPlus /> Adicionar Jogo
                    </button>
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg p-6 my-8">
                <h3 className="text-xl font-bold text-white mb-4">Logotipo da Loja</h3>
                <div className="flex items-center gap-6">
                    <div>
                        <p className="text-sm text-gray-400 mb-2">Pré-visualização:</p>
                        {logoUrl ? (
                            <img src={logoUrl} alt="Logo Preview" className="h-16 w-auto bg-gray-700 p-1 rounded" />
                        ) : (
                            <div className="h-16 w-32 bg-gray-700 flex items-center justify-center rounded text-gray-500">
                                <span>Sem logo</span>
                            </div>
                        )}
                    </div>
                    <div className="flex-grow">
                            <p className="text-sm text-gray-400 mb-2">Selecione um arquivo de imagem para usar como logotipo da sua loja.</p>
                            <div className="flex gap-4">
                            <label className="cursor-pointer px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all duration-300">
                                <span>Carregar Logo</span>
                                <input type="file" accept="image/*" className="hidden" onChange={onLogoUpload} />
                            </label>
                            {logoUrl && (
                                <button onClick={onRemoveLogo} className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all duration-300">
                                    Remover Logo
                                </button>
                            )}
                            </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-200 uppercase bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3">Capa</th>
                            <th scope="col" className="px-6 py-3">Nome</th>
                            <th scope="col" className="px-6 py-3">Preço Exclusiva</th>
                            <th scope="col" className="px-6 py-3">Preço Parental</th>
                            <th scope="col" className="px-6 py-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {games.map(game => (
                            <tr key={game.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
                                <td className="px-6 py-4"><img src={game.cover_art} alt={game.name} className="w-10 h-14 object-cover rounded" /></td>
                                <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{game.name}</th>
                                <td className="px-6 py-4 font-bold text-emerald-400">R$ {game.my_price_exclusive.toFixed(2).replace('.', ',')}</td>
                                <td className="px-6 py-4 font-bold text-blue-400">R$ {game.my_price_parental.toFixed(2).replace('.', ',')}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleEditClick(game)} className="p-2 text-blue-400 hover:text-blue-300"><IconEdit /></button>

                                    <button onClick={() => onDelete(game.id)} className="p-2 text-red-500 hover:text-red-400"><IconTrash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {games.length === 0 && <p className="text-center py-8 text-gray-400">Nenhum jogo cadastrado. Adicione sua primeira oferta para começar.</p>}
            </div>

            {showModal && <GameForm game={editingGame} onSave={handleFormSave} onCancel={() => setShowModal(false)} />}
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
function App() {
    const [route, setRoute] = useState(window.location.hash || '#home');
    const [isAdmin, setIsAdmin] = useState(false);
    const [games, setGames] = useState<Game[]>([]);
    const [logoUrl, setLogoUrl] = useState<string | null>(() => localStorage.getItem('xrdgames-logo'));

    const fetchGames = useCallback(async () => {
        const { data, error } = await supabase.from('games').select('*');
        if (error) {
            console.error('Erro ao buscar jogos:', error);
        } else {
            setGames(data as Game[]);
        }
    }, []);

    useEffect(() => {
        fetchGames();
    }, [fetchGames]);


    useEffect(() => {
        const handleHashChange = () => {
            setRoute(window.location.hash || '#home');
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const navigate = (path: string) => {
        window.location.hash = path;
    };

    const handleLogin = (password: string) => {
        if (password === ADMIN_PASSWORD) {
            setIsAdmin(true);
            navigate('#admin');
        } else {
            alert('Senha incorreta.');
        }
    };
    
    const handleLogout = () => {
        setIsAdmin(false);
        navigate('#home');
    }

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                localStorage.setItem('xrdgames-logo', base64String);
                setLogoUrl(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveLogo = () => {
        localStorage.removeItem('xrdgames-logo');
        setLogoUrl(null);
    };

    const handleSaveGame = async (gameData: Omit<Game, 'id'>, id?: string) => {
        if (id) {
            // EDITAR
            const { data, error } = await supabase.from('games').update(gameData).eq('id', id).select().single();
            if (error) {
                alert(`Erro ao atualizar jogo: ${error.message}`);
            } else if (data) {
                setGames(prevGames => prevGames.map(g => g.id === id ? data : g));
            }
        } else {
            // CRIAR NOVO
            const { data, error } = await supabase.from('games').insert(gameData).select().single();
            if (error) {
                alert(`Erro ao adicionar jogo: ${error.message}`);
            } else if (data) {
                setGames(prevGames => [...prevGames, data]);
            }
        }
    };

    const handleDeleteGame = async (id: string) => {
        console.log(`Tentando deletar o jogo com ID: ${id}`);
        if (window.confirm('Tem certeza que deseja excluir este jogo? Esta ação é permanente e não pode ser desfeita.')) {
            const { error } = await supabase.from('games').delete().eq('id', id);

            if (error) {
                console.error('Erro do Supabase ao deletar:', error);
                alert(`Erro ao deletar jogo: ${error.message}. Verifique as políticas de segurança (RLS) da sua tabela no painel do Supabase para garantir que a exclusão (DELETE) está permitida.`);
            } else {
                console.log('Jogo deletado com sucesso do Supabase.');
                setGames(prevGames => {
                    const newGames = prevGames.filter(g => g.id !== id);
                    console.log('Estado dos jogos atualizado:', newGames);
                    return newGames;
                });
            }
        } else {
             console.log('Exclusão cancelada pelo usuário.');
        }
    };

    const renderContent = () => {
        switch (route) {
            case '#admin':
                return isAdmin ? <AdminDashboard games={games} onSave={handleSaveGame} onDelete={handleDeleteGame} onLogout={handleLogout} onLogoUpload={handleLogoUpload} onRemoveLogo={handleRemoveLogo} logoUrl={logoUrl} /> : <AdminLoginPage onLogin={handleLogin} />;
            case '#login':
                 return <AdminLoginPage onLogin={handleLogin} />;
            case '#home':
            default:
                return <ClientSearchPage catalog={games} logoUrl={logoUrl} />;
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            <Header navigate={navigate} isAdmin={isAdmin} logoUrl={logoUrl} />
            <main className="container mx-auto p-4 md:p-8">
                {renderContent()}
            </main>
            <style>{`
              @keyframes fade-in-up {
                0% {
                  opacity: 0;
                  transform: translateY(20px);
                }
                100% {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              .animate-fade-in-up {
                animation: fade-in-up 0.5s ease-out forwards;
              }
            `}</style>
        </div>
    );
}

export default App;