<!DOCTYPE html>
<html>
<head>
  <title>Nome do tema - {{app.name}}</title>
  {{>metas}}
</head>
<body>
{{>header}}

<div cols="8" style="padding-right:60px">

  <article layout="margin-20 left" hidden>

    <header layout="flex no-margin">
      <h1>[[titulo]]</h1>
      <div layout="no-shrink top-30">
        <i id="btnEditaTopico" class="material-icons">&#xE5D4;</i>
      </div>
    </header>

    <div class="box" layout="flex row items-center bottom-30">
      <div id="btnBoicotes" layout="grow">
        <button type="boicotar" onclick="app.topicos.boicotar('[[_id]]')">
          <i class="fa fa-fw fa-ban"></i>
          Boicotar!
        </button>
        <button type="boicotando" onclick="app.topicos.boicotar('[[_id]]', true)" onmouseover="this.innerHTML='<i class=\'fa fa-fw fa-eye\'></i> Deixar boicote...'" onmouseout="this.innerHTML = '<i class=\'fa fa-fw fa-eye\'></i> Boicotando'" hidden>
          <i class="fa fa-fw fa-eye"></i>
          Boicotando
        </button>
      </div>
      <div text="inline-block gray-50 small" layout="right-15">
        [[dataFormatada]]
      </div>
      <div>
        <img text="middle" src="[[autor.avatar]]" alt="[[autor.nome]]" layout="circle" width="25">
        <b text="small">[[autor.nome]]</b>
      </div>
    </div>

    <p>
      [[{texto}]]
    </p>

    <p>
      [[{tagsFormatadas}]]
    </p>

    <div id="listasDoTopico">
      <div>
        <header text="white bold" layout="black padding-10 no-margin">
          [[num_motivos]] Motivos
        </header>
        <ul layout="flat" style="background: #eee">
          [[#motivos]]
          <li onclick="app.topicos.modalFonte('[[_id]]', 'motivos')" text="line-1.5" layout="padding-10 fix" style="border-bottom:1px solid rgba(0, 0, 0, .1)">
            <div layout="flex">
              <div text="2em bold black-30" layout="right-15">
                [[indice]]
              </div>
              <div class="">
                <h3 text="" layout="top-5 bottom-15">[[titulo]]</h3>
                <div text=".9em line-1.5">[[texto]]</div>
                <p text=".7em blue" layout="v-margin-15">
                  <i class="fa fa-external-link"></i>
                  [[fonte]]
                </p>
              </div>
            </div>
          </li>
          [[/motivos]]
          [[^motivos]]
          <li text="line-1.5" layout="padding-10 fix">
            <p text=".8em center" layout="no-margin">
              Nenhuma fonte ainda.
            </p>
          </li>
          [[/motivos]]
          <li onclick="app.topicos.modalFormFonte('motivos')" text=".9em line-1.5" layout="padding-10 black-10 fix">
            <i class="material-icons">&#xE145;</i> Adicionar um motivo
          </li>
        </ul>
      </div>
    </div>
  </article>

</div>

<aside id="sidebar" cols="4">
  <section layout="yellow">
    <h2 text="1.3em bold black-80" layout="top-10">Como boicotar?</h2>
    <p text=".9em"></p>
  </section>
</aside>

<script>
function __init () {
  app.topicos.carregar(app.slug())
}
</script>

{{>modal-fonte}}
{{>modal-form-fonte}}

{{>footer}}
