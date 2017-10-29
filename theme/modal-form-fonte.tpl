
<div id="modalFormFonte" data-template hidden>
  <h2 class="escondeAoEditar" layout="no-top bottom-20">Adicionar uma nova fonte:</h2>
  <h2 class="mostraAoEditar" layout="no-top bottom-20" hidden>Editar fonte:</h2>
  <form id="formFonte" action="" onsubmit="app.topicos.salvarFonte(this, event)">
    <p>
      <label text="small bold" for="fonte">Link da fonte<span text="orange">*</span>:</label>
      <input type="text" name="fonte" layout="fluid" placeholder="Cole o link da fonte a ser discutida. Pode ser de um texto, áudio, imagem ou vídeo" onchange="app.topicos.analisaFonte(this.value)">
    </p>
    <p>
      <label text="small bold" for="titulo">Título da fonte<span text="orange">*</span>:</label>
      <input type="text" name="titulo" layout="fluid" placeholder="Título contido no link da fonte">
    </p>
    <p>
      <label text="small bold" for="texto">Resumo<span text="orange">*</span>:</label>
      <textarea name="texto" layout="fluid" rows="2" placeholder="Escreva uma descrição da fonte"></textarea>
    </p>
    <p>
      <input type="hidden" name="_id">
      <input type="hidden" name="tipo">
      <button type="cancelar" layout="right" onclick="app.fechaModal(event)">Cancelar</button>
      <button class="escondeAoEditar" type="submit">Adicionar</button>
      <button class="mostraAoEditar" type="submit" hidden>Atualizar</button>
    </p>
  </form>
</div>
