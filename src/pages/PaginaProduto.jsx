import { useState } from 'react'
import { Link, useParams } from 'react-router'
import ProdutoCard from '../components/ProdutoCard'
import { normalizarPreco } from '../utils/carrinho'
import { formatarPreco } from '../utils/formatarPreco'

export default function PaginaProduto({ produtos, onAdicionar, onNotificar }) {
  const { id } = useParams()
  const [dadosAviso, setDadosAviso] = useState({ nome: '', email: '' })
  const [mensagemAviso, setMensagemAviso] = useState('')
  const produto = produtos.find((item) => item.id === id)

  if (!produto) {
    return (
      <div className="estado-vazio">
        <p>Produto não encontrado.</p>
        <Link to="/" className="botao botao-secundario">
          Voltar para a loja
        </Link>
      </div>
    )
  }

  const precoValido = Number.isFinite(normalizarPreco(produto.price)) && normalizarPreco(produto.price) > 0
  const esgotado = Number(produto.estoque) === 0
  const relacionados = produtos
    .filter(
      (item) =>
        item.category === produto.category &&
        item.id !== produto.id &&
        Number.isFinite(normalizarPreco(item.price)) &&
        Number(item.estoque) > 0
    )
    .slice(0, 4)

  function enviarAlerta(evento) {
    evento.preventDefault()
    const nome = dadosAviso.nome.trim()
    const email = dadosAviso.email.trim()

    if (!nome || !email) {
      setMensagemAviso('Preencha seu nome e e-mail para receber o aviso.')
      return
    }

    onNotificar({ produtoId: produto.id, nome, email })
    setMensagemAviso('Você foi adicionado à lista de espera e receberá um aviso quando o produto voltar.')
    setDadosAviso({ nome: '', email: '' })
  }

  return (
    <section>
      <nav className="trilha" aria-label="Você está em">
        <Link to="/">Loja</Link>
        <span aria-hidden="true">/</span>
        <span>{produto.title}</span>
      </nav>

      <div className="detalhe">
        <div className="detalhe-imagem-moldura">
          <img src={produto.image} alt={produto.title} className="detalhe-imagem" />
        </div>

        <div className="detalhe-info">
          <h1>{produto.title}</h1>
          <p className="card-avaliacao">
            ★ {produto.rating.rate} <span>({produto.rating.count} avaliações)</span>
          </p>
          <p className="detalhe-preco">
            {precoValido ? formatarPreco(normalizarPreco(produto.price)) : 'Preço indisponível'}
          </p>
          <p className="detalhe-descricao">{produto.description}</p>
          <p className="detalhe-estoque">
            {esgotado ? 'Produto esgotado' : `${produto.estoque} unidades disponíveis`}
          </p>

          {!precoValido && (
            <p className="aviso">Este produto ainda não tem preço definido e não pode ser vendido.</p>
          )}

          {precoValido && !esgotado && (
            <button className="botao botao-grande" onClick={() => onAdicionar(produto)}>
              Adicionar ao carrinho
            </button>
          )}

          {esgotado && (
            <form className="cupom" onSubmit={enviarAlerta}>
              <label htmlFor="nome-alerta" className="rotulo">
                Receber aviso quando o produto voltar
              </label>
              <div className="cupom-campo" style={{ display: 'grid', gap: '0.75rem' }}>
                <input
                  id="nome-alerta"
                  value={dadosAviso.nome}
                  onChange={(evento) =>
                    setDadosAviso((atual) => ({ ...atual, nome: evento.target.value }))
                  }
                  placeholder="Seu nome"
                />
                <input
                  type="email"
                  id="email-alerta"
                  value={dadosAviso.email}
                  onChange={(evento) =>
                    setDadosAviso((atual) => ({ ...atual, email: evento.target.value }))
                  }
                  placeholder="Seu e-mail"
                />
                <button className="botao botao-secundario" type="submit">
                  Me avise
                </button>
              </div>
              {mensagemAviso && <p className="mensagem-cupom">{mensagemAviso}</p>}
            </form>
          )}

          <ul className="detalhe-garantias">
            <li>Troca grátis em até 30 dias</li>
            <li>Parcele em até 10x sem juros</li>
          </ul>
        </div>
      </div>

      <h2>Produtos relacionados</h2>
      <div className="grade">
        {relacionados.map((item) => (
          <ProdutoCard key={item.id} produto={item} onAdicionar={onAdicionar} />
        ))}
      </div>
    </section>
  )
}
