// SecurePass Generator - Aplicativo de Geração de Senhas Seguras

// Elementos DOM
const passwordDisplay = document.getElementById('passwordText');
const passwordContainer = document.getElementById('passwordDisplay');
const copyBtn = document.getElementById('copyBtn');
const refreshBtn = document.getElementById('refreshBtn');
const generateBtn = document.getElementById('generateBtn');
const saveBtn = document.getElementById('saveBtn');
const clearSavedBtn = document.getElementById('clearSavedBtn');

// Controles
const lengthSlider = document.getElementById('lengthSlider');
const lengthValue = document.getElementById('lengthValue');
const uppercaseCheckbox = document.getElementById('uppercaseCheckbox');
const lowercaseCheckbox = document.getElementById('lowercaseCheckbox');
const numbersCheckbox = document.getElementById('numbersCheckbox');
const symbolsCheckbox = document.getElementById('symbolsCheckbox');
const excludeSimilarCheckbox = document.getElementById('excludeSimilarCheckbox');
const excludeAmbiguousCheckbox = document.getElementById('excludeAmbiguousCheckbox');

// Indicador de força
const strengthFill = document.getElementById('strengthFill');
const strengthText = document.getElementById('strengthText');

// Modais
const infoBtn = document.getElementById('infoBtn');
const settingsBtn = document.getElementById('settingsBtn');
const infoModal = document.getElementById('infoModal');
const settingsModal = document.getElementById('settingsModal');
const closeInfoModal = document.getElementById('closeInfoModal');
const closeSettingsModal = document.getElementById('closeSettingsModal');

// Configurações
const autoCopyCheckbox = document.getElementById('autoCopyCheckbox');
const darkModeCheckbox = document.getElementById('darkModeCheckbox');
const defaultLengthSlider = document.getElementById('defaultLengthSlider');
const defaultLengthValue = document.getElementById('defaultLengthValue');
const resetSettingsBtn = document.getElementById('resetSettingsBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');

// Toast
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// Lista de senhas salvas
const savedList = document.getElementById('savedList');

// Caracteres para geração
const charset = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%&*'
};

// Caracteres similares e ambíguos
const similarChars = 'il1Lo0O';
const ambiguousChars = '{}[]()/\\\'"`~,;:.<>';

// Estado da aplicação
let currentPassword = '';
let savedPasswords = JSON.parse(localStorage.getItem('securepass_saved')) || [];
let settings = JSON.parse(localStorage.getItem('securepass_settings')) || {
    autoCopy: false,
    darkMode: true,
    defaultLength: 12
};

// Inicialização
function init() {
    // Verificar compatibilidade
    if (!checkCompatibility()) {
        showToast('Algumas funcionalidades podem não estar disponíveis no seu navegador.', 'warning');
    }
    
    // Carregar configurações
    loadSettings();
    
    // Carregar senhas salvas
    renderSavedPasswords();
    
    // Gerar senha inicial
    generatePassword();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Atualizar interface
    updateStrengthIndicator();
}

// Carregar configurações
function loadSettings() {
    autoCopyCheckbox.checked = settings.autoCopy;
    darkModeCheckbox.checked = settings.darkMode;
    defaultLengthSlider.value = settings.defaultLength;
    defaultLengthValue.textContent = settings.defaultLength;
    
    // Aplicar modo escuro
    if (settings.darkMode) {
        document.body.classList.add('dark-mode');
    }
    
    // Definir comprimento padrão
    lengthSlider.value = settings.defaultLength;
    lengthValue.textContent = settings.defaultLength;
}

// Configurar event listeners
function setupEventListeners() {
    // Sliders
    lengthSlider.addEventListener('input', function() {
        lengthValue.textContent = this.value;
        generatePassword();
    });
    
    defaultLengthSlider.addEventListener('input', function() {
        defaultLengthValue.textContent = this.value;
    });
    
    // Checkboxes
    [uppercaseCheckbox, lowercaseCheckbox, numbersCheckbox, symbolsCheckbox,
     excludeSimilarCheckbox, excludeAmbiguousCheckbox].forEach(checkbox => {
        checkbox.addEventListener('change', generatePassword);
    });
    
    // Botões de ação
    copyBtn.addEventListener('click', copyPassword);
    refreshBtn.addEventListener('click', generatePassword);
    generateBtn.addEventListener('click', generatePassword);
    saveBtn.addEventListener('click', savePassword);
    clearSavedBtn.addEventListener('click', clearSavedPasswords);
    
    // Modais
    infoBtn.addEventListener('click', () => showModal(infoModal));
    settingsBtn.addEventListener('click', () => showModal(settingsModal));
    closeInfoModal.addEventListener('click', () => hideModal(infoModal));
    closeSettingsModal.addEventListener('click', () => hideModal(settingsModal));
    
    // Fechar modais ao clicar fora
    window.addEventListener('click', (e) => {
        if (e.target === infoModal) hideModal(infoModal);
        if (e.target === settingsModal) hideModal(settingsModal);
    });
    
    // Configurações
    saveSettingsBtn.addEventListener('click', saveSettings);
    resetSettingsBtn.addEventListener('click', resetSettings);
}

// Gerar senha
function generatePassword() {
    const length = parseInt(lengthSlider.value);
    const useUppercase = uppercaseCheckbox.checked;
    const useLowercase = lowercaseCheckbox.checked;
    const useNumbers = numbersCheckbox.checked;
    const useSymbols = symbolsCheckbox.checked;
    const excludeSimilar = excludeSimilarCheckbox.checked;
    const excludeAmbiguous = excludeAmbiguousCheckbox.checked;
    
    // Validar seleção
    if (!useUppercase && !useLowercase && !useNumbers && !useSymbols) {
        showToast('Selecione pelo menos um tipo de caractere!', 'error');
        lowercaseCheckbox.checked = true;
    }
    
    // Construir conjunto de caracteres
    let charPool = '';
    
    if (useUppercase) charPool += charset.uppercase;
    if (useLowercase) charPool += charset.lowercase;
    if (useNumbers) charPool += charset.numbers;
    if (useSymbols) charPool += charset.symbols;
    
    // Remover caracteres similares
    if (excludeSimilar) {
        for (const char of similarChars) {
            charPool = charPool.replace(new RegExp(char, 'g'), '');
        }
    }
    
    // Remover caracteres ambíguos
    if (excludeAmbiguous) {
        for (const char of ambiguousChars) {
            charPool = charPool.replace(new RegExp('\\' + char, 'g'), '');
        }
    }
    
    // Garantir que há caracteres suficientes
    if (charPool.length === 0) {
        charPool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    }
    
    // Gerar senha
    let password = '';
    const poolLength = charPool.length;
    
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * poolLength);
        password += charPool[randomIndex];
    }
    
    // Atualizar senha atual e exibir
    currentPassword = password;
    passwordDisplay.textContent = password;
    
    // Atualizar indicador de força
    updateStrengthIndicator();
    
    // Copiar automaticamente se configurado
    if (settings.autoCopy) {
        copyPassword();
    }
    
    return password;
}

// Atualizar indicador de força
function updateStrengthIndicator() {
    const password = currentPassword;
    let strength = 0;
    
    // Critérios de força
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[!@#$%&*]/.test(password);
    const isLong = password.length >= 12;
    const isVeryLong = password.length >= 16;
    
    // Pontuação
    if (hasUppercase) strength += 20;
    if (hasLowercase) strength += 20;
    if (hasNumbers) strength += 20;
    if (hasSymbols) strength += 20;
    if (isLong) strength += 10;
    if (isVeryLong) strength += 10;
    
    // Limitar a 100%
    strength = Math.min(strength, 100);
    
    // Atualizar barra
    strengthFill.style.width = `${strength}%`;
    
    // Atualizar texto e cor
    let strengthLabel = '';
    let color = '';
    
    if (strength < 30) {
        strengthLabel = 'Muito Fraca';
        color = '#ff3333';
    } else if (strength < 50) {
        strengthLabel = 'Fraca';
        color = '#ff6633';
    } else if (strength < 70) {
        strengthLabel = 'Média';
        color = '#ffcc00';
    } else if (strength < 90) {
        strengthLabel = 'Forte';
        color = '#99cc33';
    } else {
        strengthLabel = 'Muito Forte';
        color = '#33cc33';
    }
    
    strengthText.textContent = strengthLabel;
    strengthFill.style.background = color;
}

// Copiar senha para clipboard
function copyPassword() {
    if (!currentPassword) {
        showToast('Gere uma senha primeiro!', 'error');
        return;
    }
    
    navigator.clipboard.writeText(currentPassword)
        .then(() => {
            showToast('Senha copiada para a área de transferência!');
            
            // Efeito visual
            passwordContainer.style.animation = 'none';
            setTimeout(() => {
                passwordContainer.style.animation = 'pulse 0.5s';
            }, 10);
        })
        .catch(err => {
            console.error('Erro ao copiar:', err);
            showToast('Erro ao copiar senha!', 'error');
            
            // Fallback para dispositivos antigos
            const textArea = document.createElement('textarea');
            textArea.value = currentPassword;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                showToast('Senha copiada!');
            } catch (e) {
                showToast('Não foi possível copiar a senha.', 'error');
            }
            document.body.removeChild(textArea);
        });
}

// Salvar senha
function savePassword() {
    if (!currentPassword) {
        showToast('Gere uma senha primeiro!', 'error');
        return;
    }
    
    // Criar identificador único
    const timestamp = new Date().toISOString();
    const id = 'pass_' + timestamp;
    
    // Criar label padrão
    const label = `Senha ${savedPasswords.length + 1}`;
    
    // Adicionar à lista
    savedPasswords.unshift({
        id,
        label,
        password: currentPassword,
        timestamp,
        strength: strengthText.textContent
    });
    
    // Limitar a 20 senhas salvas
    if (savedPasswords.length > 20) {
        savedPasswords = savedPasswords.slice(0, 20);
    }
    
    // Salvar no localStorage
    localStorage.setItem('securepass_saved', JSON.stringify(savedPasswords));
    
    // Atualizar interface
    renderSavedPasswords();
    
    // Feedback
    showToast('Senha salva com sucesso!');
}

// Renderizar senhas salvas
function renderSavedPasswords() {
    if (savedPasswords.length === 0) {
        savedList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-key"></i>
                <p>Nenhuma senha salva ainda</p>
            </div>
        `;
        return;
    }
    
    savedList.innerHTML = savedPasswords.map(item => `
        <div class="saved-item" data-id="${item.id}">
            <div class="saved-item-content">
                <div class="saved-item-label">${item.label}</div>
                <div class="saved-item-password">${maskPassword(item.password)}</div>
                <div class="saved-item-meta">
                    <small>Força: ${item.strength} • ${formatDate(item.timestamp)}</small>
                </div>
            </div>
            <div class="saved-item-actions">
                <button class="copy-saved-btn" title="Copiar">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="view-saved-btn" title="Visualizar">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="delete-saved-btn" title="Excluir">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // Adicionar event listeners aos botões
    document.querySelectorAll('.copy-saved-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = this.closest('.saved-item').dataset.id;
            const item = savedPasswords.find(p => p.id === itemId);
            if (item) {
                navigator.clipboard.writeText(item.password)
                    .then(() => showToast('Senha copiada!'))
                    .catch(() => showToast('Erro ao copiar!', 'error'));
            }
        });
    });
    
    document.querySelectorAll('.view-saved-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = this.closest('.saved-item').dataset.id;
            const item = savedPasswords.find(p => p.id === itemId);
            if (item) {
                passwordDisplay.textContent = item.password;
                currentPassword = item.password;
                updateStrengthIndicator();
                showToast('Senha carregada!');
            }
        });
    });
    
    document.querySelectorAll('.delete-saved-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = this.closest('.saved-item').dataset.id;
            savedPasswords = savedPasswords.filter(p => p.id !== itemId);
            localStorage.setItem('securepass_saved', JSON.stringify(savedPasswords));
            renderSavedPasswords();
            showToast('Senha excluída!');
        });
    });
}

// Limpar senhas salvas
function clearSavedPasswords() {
    if (savedPasswords.length === 0) {
        showToast('Nenhuma senha salva para limpar!', 'error');
        return;
    }
    
    if (confirm('Tem certeza que deseja excluir TODAS as senhas salvas?')) {
        savedPasswords = [];
        localStorage.removeItem('securepass_saved');
        renderSavedPasswords();
        showToast('Todas as senhas foram excluídas!');
    }
}

// Mostrar modal
function showModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Esconder modal
function hideModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Salvar configurações
function saveSettings() {
    settings.autoCopy = autoCopyCheckbox.checked;
    settings.darkMode = darkModeCheckbox.checked;
    settings.defaultLength = parseInt(defaultLengthSlider.value);
    
    localStorage.setItem('securepass_settings', JSON.stringify(settings));
    
    // Aplicar modo escuro (não funciona)
    if (settings.darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    // Atualizar comprimento padrão
    lengthSlider.value = settings.defaultLength;
    lengthValue.textContent = settings.defaultLength;
    
    hideModal(settingsModal);
    showToast('Configurações salvas!');
}

// Redefinir configurações
function resetSettings() {
    if (confirm('Restaurar configurações padrão?')) {
        settings = {
            autoCopy: false,
            darkMode: true,
            defaultLength: 12
        };
        
        localStorage.setItem('securepass_settings', JSON.stringify(settings));
        loadSettings();
        showToast('Configurações restauradas!');
    }
}

function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    
    // Definir cor baseada no tipo
    if (type === 'error') {
        toast.style.background = '#ff3333';
        toast.style.color = '#fff';
    } else if (type === 'warning') {
        toast.style.background = '#ffcc00';
        toast.style.color = '#1a1a1a';
    } else {
        toast.style.background = '#33cc33';
        toast.style.color = '#fff';
    }
    
    // Mostrar toast
    toast.classList.add('active');
    
    // Esconder após 3 segundos
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// Funções auxiliares
function maskPassword(password) {
    if (password.length <= 4) {
        return '•'.repeat(password.length);
    }
    
    const visible = Math.floor(password.length * 0.3);
    const masked = '•'.repeat(password.length - visible);
    return password.substring(0, visible) + masked;
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Adicionar animação CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }
    
    .dark-mode {
        background: #1a1a1a !important;
    }
    
    .dark-mode .mobile-container {
        background: #222 !important;
    }
    
    .password-display {
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);

// Inicializar aplicação quando o DOM estiver carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM já carregado
    init();
}

// Verificar compatibilidade com APIs necessárias
function checkCompatibility() {
    if (!navigator.clipboard) {
        console.warn('Clipboard API não suportada. Usando fallback.');
    }
    
    if (!window.localStorage) {
        alert('Seu navegador não suporta localStorage. Algumas funcionalidades estarão limitadas.');
        return false;
    }
    
    return true;
}