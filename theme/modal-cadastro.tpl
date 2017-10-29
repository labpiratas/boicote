
<div id="modalCadastro" data-template hidden>
  <h2 class="escondeAoEditar" layout="no-top bottom-20">Cadastro:</h2>
  <form id="formCadastro" layout="fix" action="" onsubmit="app.cadastro(this, event)">
    <p>
      <label text="small bold" for="nome">Nome:</label>
      <input type="text" name="nome" layout="fluid" placeholder="Informe seu nome">
    </p>
    <p>
      <label text="small bold" for="email">E-mail:</label>
      <input type="text" name="email" layout="fluid" placeholder="Informe seu email">
    </p>
    <p>
      <label text="small bold" for="senha">Senha:</label>
      <input type="password" name="senha" layout="fluid" placeholder="******">
    </p>
    <p>
      <button type="submit" layout="left">Cadastrar</button>
      <button type="cancelar" layout="right" onclick="app.fechaModal(event)">Cancelar</button>
    </p>
  </form>
</div>
