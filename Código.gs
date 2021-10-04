function salvarFatura() {
  const pastaRaiz = DriveApp.getFolderById('ALTERAR PARA O ID DA PASTA RAIZ QUE VC VAI UTILIZAR');

  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  const nomePasta = meses[new Date().getMonth()];
  const ano = new Date().getFullYear();

  const pastaAno = pastaRaiz.getFoldersByName(ano).hasNext() ? pastaRaiz.getFoldersByName(ano).next() : pastaRaiz.createFolder(ano);

  const pastaAtual = pastaAno.getFoldersByName(nomePasta).hasNext() ? pastaAno.getFoldersByName(nomePasta).next() : pastaAno.createFolder(nomePasta);

  var date = new Date();
  var primeiroDia = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  var ultimoDia = new Date(date.getFullYear(), date.getMonth(), 0);
  // query para encontrar emails com anexo e que possuem no titulo a palavra fatura e no range do mes anterior.
  const searchQuery = `(has:attachment OR has:drive) fatura  -Lembrete after:${ano}/${new Date().getMonth()}/${primeiroDia.getUTCDate()} before:${ano}/${new Date().getMonth()}/${ultimoDia.getUTCDate()}`;

  const threads = GmailApp.search(searchQuery, 0, 10);
  threads.forEach(thread => {
    const messages = thread.getMessages();

    messages.forEach(message => {
      const attachments = message.getAttachments({
        includeInlineImages: false,
        includeAttachments: true
      });
      attachments.forEach(attachment => {
        // if (!pastaAtual.getFilesByName(attachment.getName()).next()) {
        Drive.Files.insert(
          {
            title: attachment.getName(),
            mimeType: attachment.getContentType(),
            parents: [{ id: pastaAtual.getId() }]
          },
          attachment.copyBlob()
        );
        // }
      });
    });
  });
  
  // comentar a linha 44 caso não queira excluir os emails.
  GmailApp.moveThreadsToTrash(threads);
}
