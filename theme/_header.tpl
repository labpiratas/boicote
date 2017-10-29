
<header>
  <div class="maxWidth" text="black-80" layout="flex row items-center justify-center h-padding-15" style="height:70px">
    <a href="/" class="titulo-principal">
      <strong text="giant">
        <i class="fa fa-ban" text="red"></i>
        Boicote!
      </strong>
    </a>
    <!-- <menu text="right" layout="grow right-40" links="gray-60 hover-blue">
      <a href="#">APRENDA</a>
      <a href="#">SOBRE</a>
      <a href="#">APP</a>
    </menu> -->
    <div layout="flex items-center grow" text="right" links="gray-60 hover-blue">
      <div layout="grow">
        <a layout="inline-block" href="/topico-form">Iniciar um boicote!</a>
      </div>
      &nbsp; &nbsp;
      <!-- <div id="areaDeNotificacoes" layout="relative">
        <i class="material-icons">notifications</i>
        <span class="label">3</span>
        <menu layout="absolute" hidden>
          <a href="#" layout="flex row items-center">
            <span style="flex-shrink: 0">
              <img src="/img/arthur.jpg" alt="Art" layout="circle" width="50">
            </span>
            <span style="padding-left:15px">
              <b>Arthur Araújo</b> comentou o tema
              <span class="fakelink">Cuidados a se tormar em relação a uma rinite alérgica</span>
              <br>
              <i class="fa fa-fw fa-comments"></i> <span>5 minutos</span>
            </span>
          </a>
          <a href="/perfil/notificacoes" layout="flex row items-center">
            <span style="flex-shrink: 0">
              Ver todas as notificações
            </span>
          </a>
        </menu>
      </div> -->
      <div id="areaDoUsuario" layout="inline-block" data-template hidden style="padding: 12px">
        <img src="[[avatar]]" alt="[[nome]]" width="50" layout="circle left">
        <menu>
          <!-- <a href="#">Perfil</a> -->
          <!-- <a href="#">Configurações</a> -->
          <a href="#" onclick="app.logout(event)">Sair</a>
        </menu>
      </div>
      <div id="areaDoVisitante" layout="inline-block" hidden>
        <button onclick="app.modal(app.template.modalLogin, ['button', 'escape'], 400)" type="outline">
          login
        </button>
        &nbsp;
        <button type="button" onclick="app.modal(app.template.modalCadastro, ['button', 'escape'], 400)">cadastro</button>
      </div>
    </div>
  </div>
</header>

<main>
  <div class="maxWidth">
