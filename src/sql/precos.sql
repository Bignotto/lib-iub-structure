--MADEIRA!
select
	T0.ItemCode [Item],
	99999 [UltimoDoc],
	808.36 [UltimoPreco],
	getdate() [UltimaCompra],
	T0.InvntryUom [Unidade],
	T0.ValidComm [ContaGerencial],
	T0.ItemName [Descricao],
	'SERRARIA BIGNOTTO' [Fornecedor],
	0 [ICMS],
	0 [IPI],
	0 [COFINS],
	0 [PIS],
	0 [ISS]
from [dbo].[OITM] T0
where T0.ItemCode = 'I08556'

union

select distinct P0.Item, P0.UltimoDoc, P0.UltimoPreco,
  P1.DocDate [UltimaCompra],
  P5.unitMsr [Unidade],
  P3.ValidComm [CongaGerencial],
  P3.ItemName [Descricao],
  P1.CardCode + '  ' + P1.CardName [Fornecedor],
  P4.TaxRate [ICMS],
  P6.TaxRate [IPI],
  P7.TaxRate [COFINS],
  P8.TaxRate [PIS],
  P9.TaxRate [ISS]

from (

select distinct T0.U_UPItmCod [Item],
    T2.Nota [UltimoDoc],
    max(T4.PriceBefDi) [UltimoPreco]

  from [dbo].[@UPR_RTE1] T0
    inner join [dbo].[OITM] T1 on T1.ItemCode = T0.U_UPItmCod
    left join (
		select
      T1.ItemCode,
      max(T0.DocEntry) [Nota]
    from [dbo].[OPCH] T0
      inner join [dbo].[PCH1] T1 on T1.DocEntry = T0.DocEntry
      inner join [dbo].[PCH12] T2 on T2.DocEntry = T0.DocEntry
    where T2.MainUsage not in (11,64,39,32,30,59,38,20,61,56)
    group by
			T1.ItemCode
		) T2 on T2.ItemCode = T1.ItemCode
    left join [dbo].[OPCH] T3 on T3.DocEntry = T2.Nota
    left join [dbo].[PCH1] T4 on T4.DocEntry = T3.DocEntry and T4.ItemCode = T0.U_UPItmCod

  where T0.U_UPItmCod not in (select distinct U_UPItmCod
  from [@UPR_ORTE])

  group by
  T0.U_UPItmCod,
  T2.Nota
) P0
  left join [dbo].[OPCH] P1 on P1.DocEntry = P0.UltimoDoc
  left join [dbo].[PCH1] P5 on P5.DocEntry = P0.UltimoDoc and P5.ItemCode = P0.Item
  left join [dbo].[PCH12] P12 on P12.DocEntry = P1.DocEntry
  left join [dbo].[OITM] P3 on P3.ItemCode = P0.Item

  left join [dbo].[PCH4] P4 on P4.DocEntry = P0.UltimoDoc and P4.LineNum = P5.LineNum and P4.StaCode like 'ICM%' and P4.TaxRate > 0
  left join [dbo].[PCH4] P6 on P6.DocEntry = P0.UltimoDoc and P6.LineNum = P5.LineNum and P6.StaCode like 'IPI%' and P6.TaxRate > 0
  left join [dbo].[PCH4] P7 on P7.DocEntry = P0.UltimoDoc and P7.LineNum = P5.LineNum and P7.StaCode like 'COF%' and P7.TaxRate > 0
  left join [dbo].[PCH4] P8 on P8.DocEntry = P0.UltimoDoc and P8.LineNum = P5.LineNum and P8.StaCode like 'PIS%' and P8.TaxRate > 0
  left join [dbo].[PCH4] P9 on P9.DocEntry = P0.UltimoDoc and P9.LineNum = P5.LineNum and P9.StaCode like 'ISS%' and P9.TaxRate > 0

