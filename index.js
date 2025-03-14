function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

document.querySelectorAll('.letterInput').forEach((input, index, inputs) => {
    input.addEventListener('input', function() {
        const letter = this.value.toLowerCase(); // Converte a letra para minúscula
        if (!/^[a-zà-ÿ]$/.test(letter)) {
            this.value = '';
        } else {
            document.getElementById(`tab${index + 1}`).textContent = letter;
        }
    });
});

document.getElementById('buscar').addEventListener('click', async function() {
    const letters = Array.from(document.querySelectorAll('.letterInput')).map(input => removeAccents(input.value.toLowerCase())); // Converte todas as letras para minúsculas e remove acentos
    const mainLetter = letters[6]; // Sétima letra

    if (letters.some(letter => letter === '')) {
        alert('Por favor, preencha todas as letras.');
        return;
    }

    try {
        const response = await fetch('listacompleta.json');
        const data = await response.json();

        console.log('Data loaded:', data);
        console.log('Letters:', letters);
        console.log('Main letter:', mainLetter);

        const filteredWords = data.filter(word => {
            word = removeAccents(word.toLowerCase()); // Converte a palavra para minúscula e remove acentos
            // Verifica se a palavra contém a letra principal
            if (!word.includes(mainLetter)) {
                return false;
            }

            // Verifica se a palavra tem entre 4 e 12 letras
            if (word.length < 4 || word.length > 12) {
                return false;
            }

            // Verifica se a palavra contém APENAS as letras fornecidas
            const wordLetters = word.split('');
            const allowedLetters = new Set(letters); // Converte o array de letras em um Set para facilitar a verificação

            // Verifica se todas as letras da palavra estão no conjunto de letras permitidas
            return wordLetters.every(letter => allowedLetters.has(letter));
        });

        console.log('Filtered words:', filteredWords);

        const groupedWords = filteredWords.reduce((acc, word) => {
            const length = word.length;
            if (!acc[length]) acc[length] = [];
            acc[length].push(word);
            return acc;
        }, {});

        console.log('Grouped words:', groupedWords);

        // Armazena os resultados no localStorage
        localStorage.setItem('groupedWords', JSON.stringify(groupedWords));

        // Verifica se os dados foram salvos corretamente
        const storedData = localStorage.getItem('groupedWords');
        if (!storedData) {
            console.error('Erro ao salvar dados no localStorage.');
            return;
        }

        console.log('Dados salvos no localStorage:', storedData);

        // Redireciona para a página de resultados
        window.location.href = 'resultados.html';

    } catch (error) {
        console.error('Erro ao buscar palavras:', error);
    }
});

// Função para baixar os dados do localStorage como um arquivo JSON
document.getElementById('baixar').addEventListener('click', function() {
    const groupedWords = localStorage.getItem('groupedWords');
    if (!groupedWords) {
        alert('Nenhum dado encontrado no localStorage.');
        return;
    }

    const blob = new Blob([groupedWords], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resultados.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});