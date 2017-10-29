
<div id="modalFonte" data-template hidden>
  <header layout="flex bottom-10 fix">
    <div layout="right-10" style="margin-top:-8px">
      <i class="material-icons voto-sim [[votouSim]]" onhover="pointer" style="font-size:2.8em" onclick="app.topicos.votar(1, this)">&#xE316;</i> <br>
      <i class="material-icons voto-nao [[votouNao]]" onhover="pointer" style="font-size:2.8em" onclick="app.topicos.votar(-1, this)">&#xE313;</i>
    </div>
    <div layout="auto grow">
      <h2 text="line-1" layout="no-margin no-bottom fix">
        [[{titulo}]]
      </h2>
      <p text="small" style="margin-top:-10px">
        <a href="[[fonte]]" target="_blank">[[fonte]]</a>
      </p>
    </div>
    <div>
      <i id="btnEditaFonte" class="material-icons">&#xE5D4;</i>
    </div>
  </header>

  <div class="box" layout="flex row items-center bottom-20">
    <div text="1.4em gray-20" layout="grow">
      <!-- TOOLBARS -->
    </div>
    <div text="inline-block gray-50 small" layout="right-15">
      [[dataFormatada]]
    </div>
    <div>
      <img text="middle" src="[[autor.avatar]]" alt="[[autor.nome]]" layout="circle" width="25">
      <b text="small">[[autor.nome]]</b>
    </div>
  </div>

  <p text=".8em gray" layout="flex row items-center no-margin" style="padding-bottom:15px">
    <span layout="grow">[[num_comentarios]] comentários &nbsp; </span>
  </p>

  <ul id="comentariosDoModal" data-template layout="flat">
    [[#comentarios]]
    <li id="comentario_[[_id]]" text="line-1.5" layout="v-padding-10 fix" style="border-top:1px solid rgba(0, 0, 0, .1)">
      <div layout="left">
        <img src="[[autor.avatar]]" alt="[[autor.nome]]" layout="circle" width="40">
      </div>
      <div layout="auto" style="padding-left:10px">
        <div layout="flex">
          <h3 text=".8em bold" layout="grow no-margin">
            [[autor.nome]] <span text="normal gray-30">@[[autor.nick]] [[dataFormatadaHumana]]</span>
            [[btnRemoveComentario]]
          </h3>
          <span class="btn-remove" onclick="app.topicos.confirmaRemoverComentario('[[_id]]')" layout="[[btnRemoveComentario]]">&times;</span>
        </div>
        <div text=".8em" layout="no-margin">
          [[{comentario}]]
        </div>
      </div>
    </li>
    [[/comentarios]]
  </ul>

  [[#usuario]]
  <div class="rBox" layout="flex items-center" style="margin:20px -32px -32px">
    <div style="padding-right:10px;">
      <img src="[[usuario.avatar]]" alt="[[usuario.nome]]" layout="circle" width="40">
    </div>
    <textarea id="caixaDeComentario" name="name" rows="2" layout="no-margin grow" placeholder="Comente sobre o assunto" onkeydown="app.topicos.enviaComentario('[[_id]]', this.value, event)"></textarea>
  </div>
  [[/usuario]]

</div>
