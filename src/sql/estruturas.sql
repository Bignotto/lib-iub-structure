/*
Extração dos Roteiros de Produção 
[dbo].[@UPR_ORTE]

Os roteiros são recursivos.
O roteiro de um produto pode conter outros roteiros para sub produtos. O que determina se um determinado item 
é um sub produto é o fato de que quando um sub item aparece na lista que identifica os roteiros.

TipoLinha:	Identifica o que esta linha significa no contexto dos dados. Isso vai ajudar na identificação
			dos itens que precisam ser somados quando a estrutura do produto for somada para a formação do custo.
			
			SERVICO: serviços prestados por terceiros que compõem o custo de um sub produto industrializado.

			SUB: sub produto, existe um roteiro que compõem esse item.

			INSUMO: insumo de produção.

			RECURSO: contem o tempo da operação daquele item.

			MADEIRA: identifica quando o insumo for madeira, este tem tratamento diferenciado na estrutura.
TODO:
[ ] Mover a busca por um roteiro distinto do CASE para o JOIN
*/

--declare @data1 as date
--declare @data2 as date

--set @data1 = '01/01/2018'
--set @data2 = getdate()

select
	R0.Code [CodRoteiro],
	R0.Name [NomeRoteiro],
	upper(R0.U_UPItmCod) [ItemPaiRoteiro],
	upper(PAI.U_UPCodIAn) [ItemPaiIub],
	PAI.ItemName [DescricaoItem],
	P0.Name [ItemPaiTipoProduto],
	R0.U_UPWhsCod [DepositoDestino],
	R0.[Object] [TipoDocumento],
	[TipoLinha] = CASE
		when R1.U_UPItmCod like 'S%' then 'SERVICO'
		when R1.U_UPItmCod in ('I08556','I08563','I02777','I08675','I02792','I08986') then 'MADEIRA'
		--se existe roteiro cadastrado para o item logo este item deve ser um sub-produto
		when R1.U_UPItmCod in (select distinct U_UPItmCod from [@UPR_ORTE]) then 'SUB'
		when R1.U_UPGpRCod is null then 'INSUMO'
		else 'RECURSO'
	end,
	R1.U_UPGpRCod [Recurso],
	R1.U_UPItmCod [Insumo],
	R1.U_UPRecQtd [InsumoQuantidade],
	SUB.ItemName [InsumoDescricao],
	SUB.U_UPTpProd [InsumoTipo],
	SUB.InvntryUom [InsumoUnidade],
	S0.Name [InsumoTipoProduto],
	SUB.QryGroup2 [InsumoIndustrializado],
	R1.U_UPTmpVar [RecursoTempo],
	R2.Name [RecursoNome],
	R2.U_UPCstHor [RecursoCustoHora],
	CG.PrcCode [InsumoCodContaGerencial],
	CG.PrcName [InsumoContaGerencial]
	--X0.UltimoPreco,
	--X0.UltimoDoc

from [dbo].[@UPR_ORTE] R0
	inner join [dbo].[@UPR_RTE1] R1 on R0.Code = R1.Code
	left join [dbo].[@UPR_OGPR] R2 on R1.U_UPGpRCod = R2.Code

	left join [dbo].[OITM] PAI on PAI.ItemCode = R0.U_UPItmCod
	left join [dbo].[OITM] SUB on SUB.ItemCode = R1.U_UPItmCod

	left join [dbo].[@UPP_TPRD] P0 on PAI.U_UPTpProd = P0.Code
	left join [dbo].[@UPP_TPRD] S0 on SUB.U_UPTpProd = S0.Code

	left join [dbo].[OPRC] CG on CG.PrcCode = SUB.ValidComm

where (R1.U_UPGpRCod is not null
	or R1.U_UPItmCod is not null)
	and R0.U_UPInativ = 'N'

--ORDENAMENTO OBRIGATÓRIO
--Força a separação para a estrutura a apresentar os subprodutos por último
order by 1, 9

--select * from [OITM] where QryGroup2='Y'
