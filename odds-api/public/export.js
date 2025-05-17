function exportTableToExcel() {
    // Seleciona a tabela pelo id
    var table = document.getElementById("tabela-jogos");
    var html = table.outerHTML;

    // Prepara o conteúdo para exportação em formato Excel
    var url = 'data:application/vnd.ms-excel,' + encodeURIComponent(html);

    // Cria um link temporário para download
    var a = document.createElement('a');
    a.href = url;
    a.download = 'tabela_odds.xls';

    // Dispara o clique para iniciar o download
    a.click();
}
