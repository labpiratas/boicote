
<div id="modalLogin" data-template hidden>
  <h2 class="escondeAoEditar" layout="no-top bottom-20">Acesso ao site:</h2>
  <form id="formLogin" layout="fix" onsubmit="app.login(this, event); return false">
    <p>
      <label text="small bold" for="email">E-mail:</label>
      <input type="text" name="email" layout="fluid" placeholder="Informe seu email">
    </p>
    <p>
      <label text="small bold" for="senha">Senha:</label>
      <input type="password" name="senha" layout="fluid" placeholder="******">
    </p>
    <!-- <p>
      <label text="small bold" for="lembrar">
        <input type="checkbox" name="lembrar" placeholder="******" value="1"> Lembrar-me
      </label>
    </p> -->
    <p>
      <button type="submit" layout="left">Login</button>
      <button type="cancelar" layout="right" onclick="app.fechaModal(event)">Cancelar</button>
    </p>
  </form>
</div>
