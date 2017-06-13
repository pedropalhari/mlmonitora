var request = require('request');
var colors = require('colors');
const notifier = require('node-notifier');

process.stdout.write('\033c');

var isFirst = true;

function searchString(string, stringProcurada) {
    var indexes = [];

    var index = 0;

    while (index != -1) {
        index = string.indexOf(stringProcurada, index + 1);

        if (index != -1)
            indexes.push(index);
    }

    return indexes;
}

var lastPrice = 0;

//Função separada pra executar ela uma vez e depois ficar dentro do set Interval
function executa() {
    //'http://informatica.mercadolivre.com.br/placas-video/pci-express/rx-470_OrderId_PRICE'

    //Passo o endereço por argv
    request(process.argv[2], function (error, response, body) {
        //console.log('body:', JSON.stringify(body)); // Print the HTML for the Google homepage.

        //TRATAMENTO DE ERRO 1
        //Se não deu pra conectar, retorna
        //Se for a primeira vez, tenta agressivamente reconectar (popular a tela e ficar bonitinho)
        if (body == undefined) {
            if (isFirst)
                setTimeout(() => { executa(); }, 3000);
            return;
        }

        //Seto as tags de procura, função me retorna um array onde elas foram encontradas
        var procuradoNumero = 'class=\"ch-price\">';
        var procuradoNome = "width=\'210\' alt=";
        var numArray = searchString(body, procuradoNumero);
        var nomeArray = searchString(body, procuradoNome);

        //Array de nomes a partir das posições
        var nomeArrayDefinitivo = [];

        //Pega os endereços das posições e com um pouco de fuçada te dá os nomes
        for (var i = 0; i < nomeArray.length; i++) {
            var nomes = "";
            for (var j = 0; j < 100; j++)
                if (body[nomeArray[i] + procuradoNome.length + 1 + j] != '\'')
                    nomes += body[nomeArray[i] + procuradoNome.length + 1 + j]
                else
                    break;

            nomeArrayDefinitivo.push(nomes);
        }

        //Mesma coisa dos nomes, só que com os preços
        var numArrayDefinitivo = [];
        //Pula 2 porque sempre tem lixo entre duas placas
        for (var i = 0; i < numArray.length; i += 2) {
            var preco = "";

            for (var j = 0; j < 10; j++)
                if (body[numArray[i] + procuradoNumero.length + 1 + j] != '<')
                    preco += body[numArray[i] + procuradoNumero.length + 1 + j]
                else
                    break;

            numArrayDefinitivo.push(preco);
        }

        //TRATAMENTO DE ERRO 2
        //Se não deu pra conectar, retorna
        //Se for a primeira vez, tenta agressivamente reconectar (popular a tela e ficar bonitinho)
        if (nomeArrayDefinitivo[0] == undefined) {
            if (isFirst)
                setTimeout(() => { executa(); }, 3000);
            return;
        }

        if (isFirst) {
            isFirst = false;

            notifier.notify({
                title: 'Programa rodando',
                message: 'Qualquer atualização de preço será notificada por aqui',
                sound: true
            });
        }

        //Se deu, limpa a tela e printa a lista atualizada
        process.stdout.write('\033c');

        //Processo para identificar se o preço novo é menor e emitir notificação
        let menorPreco = '';
        for (var i = 0; i < numArrayDefinitivo[0].length; i++)
            //Ascii de 0 a 9
            if (numArrayDefinitivo[0].charCodeAt(i) > 47 && numArrayDefinitivo[0].charCodeAt(i) < 58)
                menorPreco += numArrayDefinitivo[0][i];

        if (lastPrice < parseInt(menorPreco) && lastPrice != 0) {
            notifier.notify({
                title: 'Você tem um novo menor preço na sua lista!',
                message: 'O menor preço era R$' + lastPrice + ' e agora é R$' + parseInt(menorPreco),
                sound: true
            });
        }

        //Se especificar, só printa os X primeiros
        var quantos = process.argv[4] == undefined ? nomeArrayDefinitivo.length : parseInt(process.argv[4]);

        //Printa com corzinha
        for (var i = quantos - 1; i >= 0; i--) {
            console.log(nomeArrayDefinitivo[i].green);
            console.log(numArrayDefinitivo[i].red);
        }
    });
}

executa();

setInterval(() => {
    executa();
}, parseInt(process.argv[3]) * 1000);

