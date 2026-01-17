// SecurePass Generator - Aplicativo de Geração de Senhas Seguras
// Versão TypeScript (simplificada)

// Tipos TypeScript
interface PasswordSettings {
    autoCopy: boolean;
    darkMode: boolean;
    defaultLength: number;
}

interface SavedPassword {
    id: string;
    label: string;
    password: string;
    timestamp: string;
    strength: string;
}

// Elementos DOM
const passwordDisplay: HTMLElement = document.getElementById('passwordText')!;
const copyBtn: HTMLButtonElement = document.getElementById('copyBtn') as HTMLButtonElement;
const refreshBtn: HTMLButtonElement = document.getElementById('refreshBtn') as HTMLButtonElement;
const generateBtn: HTMLButtonElement = document.getElementById('generateBtn') as HTMLButtonElement;
const saveBtn: HTMLButtonElement = document.getElementById('saveBtn') as HTMLButtonElement;

// Controles
const lengthSlider: HTMLInputElement = document.getElementById('lengthSlider') as HTMLInputElement;
const lengthValue: HTMLElement = document.getElementById('lengthValue')!;
const uppercaseCheckbox: HTMLInputElement = document.getElementById('uppercaseCheckbox') as HTMLInputElement;
const lowercaseCheckbox: HTMLInputElement = document.getElementById('lowercaseCheckbox') as HTMLInputElement;
const numbersCheckbox: HTMLInputElement = document.getElementById('numbersCheckbox') as HTMLInputElement;
const symbolsCheckbox: HTMLInputElement = document.getElementById('symbolsCheckbox') as HTMLInputElement;

// Estado da aplicação
let currentPassword: string = '';
let savedPasswords: SavedPassword[] = JSON.parse(localStorage.getItem('securepass_saved')!) || [];
let settings: PasswordSettings = JSON.parse(localStorage.getItem('securepass_settings')!) || {
    autoCopy: false,
    darkMode: true,
    defaultLength: 12
};

// Conjunto de caracteres
const charset = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%&*'
};

// Função principal para gerar senha
function generatePassword(): string {
    const length: number = parseInt(lengthSlider.value);
    const useUppercase: boolean = uppercaseCheckbox.checked;
    const useLowercase: boolean = lowercaseCheckbox.checked;
    const useNumbers: boolean = numbersCheckbox.checked;
    const useSymbols: boolean = symbolsCheckbox.checked;
    
    // Construir conjunto de caracteres
    let charPool: string = '';
    
    if (useUppercase) charPool += charset.uppercase;
    if (useLowercase) charPool += charset.lowercase;
    if (useNumbers) charPool += charset.numbers;
    if (useSymbols) charPool += charset.symbols;
    
    // Validar seleção
    if (charPool.length === 0) {
        // Padrão: usar todos os caracteres se nenhum selecionado
        charPool = charset.lowercase + charset.uppercase + charset.numbers;
        lowercaseCheckbox.checked = true;
        uppercaseCheckbox.checked = true;
        numbersCheckbox.checked = true;
    }
    
    // Gerar senha
    let password: string = '';
    const poolLength: number = charPool.length;
    
    for (let i = 0; i < length; i++) {
        const randomIndex: number = Math.floor(Math.random() * poolLength);
        password += charPool[randomIndex];
    }
    
    // Atualizar senha atual
    currentPassword = password;
    passwordDisplay.textContent = password;
    
    return password;
}

// Função para copiar senha
function copyPassword(): void {
    if (!currentPassword) {
        alert('Gere uma senha primeiro!');
        return;
    }
    
    navigator.clipboard.writeText(currentPassword)
        .then(() => {
            alert('Senha copiada para a área de transferência!');
        })
        .catch(err => {
            console.error('Erro ao copiar:', err);
            alert('Erro ao copiar senha!');
        });
}

// Função para salvar senha
function savePassword(): void {
    if (!currentPassword) {
        alert('Gere uma senha primeiro!');
        return;
    }
    
    const timestamp: string = new Date().toISOString();
    const id: string = 'pass_' + timestamp;
    
    const newPassword: SavedPassword = {
        id,
        label: `Senha ${savedPasswords.length + 1}`,
        password: currentPassword,
        timestamp,
        strength: 'Média' // Em uma versão completa, calcularíamos a força real
    };
    
    savedPasswords.unshift(newPassword);
    
    // Limitar a 20 senhas
    if (savedPasswords.length > 20) {
        savedPasswords = savedPasswords.slice(0, 20);
    }
    
    // Salvar no localStorage
    localStorage.setItem('securepass_saved', JSON.stringify(savedPasswords));
    
    alert('Senha salva com sucesso!');
}

// Configurar event listeners
function setupEventListeners(): void {
    // Atualizar valor do slider
    lengthSlider.addEventListener('input', () => {
        lengthValue.textContent = lengthSlider.value;
        generatePassword();
    });
    
    // Checkboxes
    [uppercaseCheckbox, lowercaseCheckbox, numbersCheckbox, symbolsCheckbox]
        .forEach(checkbox => {
            checkbox.addEventListener('change', generatePassword);
        });
    
    // Botões
    copyBtn.addEventListener('click', copyPassword);
    refreshBtn.addEventListener('click', generatePassword);
    generateBtn.addEventListener('click', generatePassword);
    saveBtn.addEventListener('click', savePassword);
}

// Inicializar aplicação
function init(): void {
    // Carregar configurações
    if (settings.darkMode) {
        document.body.classList.add('dark-mode');
    }
    
    // Definir comprimento padrão
    lengthSlider.value = settings.defaultLength.toString();
    lengthValue.textContent = settings.defaultLength.toString();
    
    // Gerar senha inicial
    generatePassword();
    
    // Configurar event listeners
    setupEventListeners();
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', init);

// Exportar para uso em outros módulos (se necessário)
export { generatePassword, copyPassword, savePassword, SavedPassword, PasswordSettings };