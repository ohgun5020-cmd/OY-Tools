import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"

import { logoutAction } from "../auth/actions"
import { isAdminUser } from "@/lib/admin"
import { getCurrentUser, getPsdUsage, getUserStats } from "@/lib/auth"
import { LOCALE_PATHS, isLocaleCode, type LocaleCode } from "@/lib/seo"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type DashboardCopy = {
  dateLocale: string
  planLabels: Record<string, string>
  statusLabels: Record<string, string>
  periods: Record<"lifetime" | "day" | "month" | "year", string>
  count: (value: number) => string
  homeLabel: string
  admin: string
  logout: string
  workspaceLabel: string
  headline: (name: string) => [string, string]
  workspaceDescription: string
  summary: {
    currentPlan: string
    paymentStatus: string
    psdRemaining: string
    loginMethod: string
    activeSessions: string
    activeSessionsValue: (value: number) => string
  }
  account: {
    title: string
    email: string
    joinedAt: string
    billingManage: string
  }
  unknown: string
  unlimitedCount: string
  paddleCheck: string
  freePlan: string
  usage: {
    sectionLabel: string
    title: string
    description: string
    webBasis: string
    currentMember: string
    currentMemberHelp: string
    remaining: string
    used: string
    reset: string
    unlimited: string
    remainingHelp: (period: string, limit: string) => string
    usedHelp: (period: string) => string
    resetHelp: string
    noReset: string
    noResetHelp: string
    policyTitle: string
    policyNote: string
    policyItems: string[]
  }
  billing: {
    sectionLabel: string
    title: string
    description: string
    currentPlan: string
    currentPlanHelp: string
    nextBilling: string
    nextBillingHelp: string
    customerPortal: string
    connected: string
    pending: string
    connectedHelp: string
    pendingHelp: string
    overviewTitle: string
    overviewDescription: string
    updatePaymentTitle: string
    updatePaymentDescription: string
    cancelTitle: string
    cancelDescription: string
    noSubscriptionTitle: string
    noSubscriptionDescription: string
    viewPricing: string
  }
}

const dashboardCopy: Record<LocaleCode, DashboardCopy> = {
  ko: {
    dateLocale: "ko-KR",
    planLabels: {
      free: "Free",
      basic: "Basic",
      basic_yearly: "Basic 연간",
      pro: "Pro",
      pro_yearly: "Pro 연간",
      admin: "관리자",
    },
    statusLabels: {
      active: "활성",
      free: "무료",
      inactive: "비활성",
      on_trial: "체험 중",
      trialing: "체험 중",
      past_due: "결제 확인 필요",
      payment_failed: "결제 실패",
      paused: "일시 중지",
      canceled: "취소됨",
      refunded: "환불됨",
      chargeback: "차지백",
      chargeback_warning: "차지백 확인 필요",
    },
    periods: { lifetime: "전체 기간", day: "오늘", month: "이번 달", year: "올해" },
    count: (value) => `${value}회`,
    homeLabel: "PIGER 홈으로 이동",
    admin: "관리자",
    logout: "로그아웃",
    workspaceLabel: "WORKSPACE",
    headline: (name) => [`${name}님,`, "변환 작업을 이어가세요."],
    workspaceDescription:
      "결제 플랜, 세션, 계정 정보를 한 곳에서 확인할 수 있습니다. 작업 기록과 팀 리뷰 링크도 앞으로 이곳에 연결할 예정입니다.",
    summary: {
      currentPlan: "현재 플랜",
      paymentStatus: "결제 상태",
      psdRemaining: "PSD 남음",
      loginMethod: "로그인 방식",
      activeSessions: "활성 세션",
      activeSessionsValue: (value) => `${value}개`,
    },
    account: { title: "계정 정보", email: "이메일", joinedAt: "가입일", billingManage: "결제 관리" },
    unknown: "확인 중",
    unlimitedCount: "무제한",
    paddleCheck: "Paddle에서 확인",
    freePlan: "무료 플랜",
    usage: {
      sectionLabel: "PSD USAGE",
      title: "PSD 만들기 사용량",
      description: "플러그인에서 PSD 만들기가 성공하면 생성된 PSD 파일 개수만큼 웹 DB에 기록됩니다.",
      webBasis: "웹 기준",
      currentMember: "CURRENT MEMBER",
      currentMemberHelp: "현재 계정에 적용된 회원 구분입니다.",
      remaining: "REMAINING",
      used: "USED",
      reset: "RESET",
      unlimited: "제한 없이 사용할 수 있습니다.",
      remainingHelp: (period, limit) => `${period} 기준 ${limit} 중 남은 횟수입니다.`,
      usedHelp: (period) => `${period} 사용한 PSD 만들기 횟수입니다.`,
      resetHelp: "한국 시간 기준으로 다음 기간이 시작됩니다.",
      noReset: "리셋 없음",
      noResetHelp: "베타 기간에는 무료 계정도 제한 없이 사용할 수 있습니다.",
      policyTitle: "플랜 변경 시 PSD 횟수 정책",
      policyNote:
        "베타 기간에는 무료 계정도 PSD 만들기를 무제한으로 사용할 수 있고, 유료 월간은 월 단위, 유료 연간은 연 단위로 PSD 파일 개수만큼 차감됩니다.",
      policyItems: [
        "베타 기간 동안 무료 계정의 PSD 만들기 횟수는 차감하지 않습니다.",
        "월간 Basic/Pro는 이번 달 사용량을 공유하고, 연간 Basic/Pro는 올해 사용량을 공유합니다.",
        "업그레이드는 즉시 적용하고, 다운그레이드는 다음 결제일부터 적용합니다.",
        "ZIP으로 PSD 10개가 생성되면 10회 차감합니다.",
        "PSD가 다운로드 가능 상태가 되지 않으면 예약 차감을 복구합니다.",
        "결제 실패는 3일 유예, 환불과 차지백은 즉시 회수합니다.",
        "남은 횟수는 이월되지 않으며 리셋은 한국 시간(KST) 기준입니다.",
      ],
    },
    billing: {
      sectionLabel: "BILLING",
      title: "결제와 구독 관리",
      description:
        "카드 변경, 구독 취소, 결제 내역 확인은 Paddle 보안 포털에서 직접 처리됩니다. 별도 문의 없이 결제 정보를 직접 관리할 수 있습니다.",
      currentPlan: "CURRENT PLAN",
      currentPlanHelp: "현재 적용 중인 요금제입니다.",
      nextBilling: "NEXT BILLING",
      nextBillingHelp: "다음 결제일 또는 갱신 상태입니다.",
      customerPortal: "CUSTOMER PORTAL",
      connected: "연결됨",
      pending: "대기 중",
      connectedHelp: "Paddle 포털로 이동할 수 있습니다.",
      pendingHelp: "유료 결제 후 자동으로 연결됩니다.",
      overviewTitle: "결제 내역 보기",
      overviewDescription: "영수증과 결제 기록을 확인합니다.",
      updatePaymentTitle: "카드 변경",
      updatePaymentDescription: "저장된 결제 수단을 수정합니다.",
      cancelTitle: "구독 취소",
      cancelDescription: "Paddle 구독 취소 화면으로 이동합니다.",
      noSubscriptionTitle: "아직 관리할 구독이 없습니다.",
      noSubscriptionDescription:
        "Basic 또는 Pro를 선택하면 결제 완료 후 이 영역에서 카드 변경과 구독 취소를 직접 처리할 수 있습니다.",
      viewPricing: "요금제 보기",
    },
  },
  en: {
    dateLocale: "en-US",
    planLabels: {
      free: "Free",
      basic: "Basic",
      basic_yearly: "Basic yearly",
      pro: "Pro",
      pro_yearly: "Pro yearly",
      admin: "Admin",
    },
    statusLabels: {
      active: "Active",
      free: "Free",
      inactive: "Inactive",
      on_trial: "On trial",
      trialing: "On trial",
      past_due: "Payment check needed",
      payment_failed: "Payment failed",
      paused: "Paused",
      canceled: "Canceled",
      refunded: "Refunded",
      chargeback: "Chargeback",
      chargeback_warning: "Chargeback review needed",
    },
    periods: { lifetime: "all time", day: "today", month: "this month", year: "this year" },
    count: (value) => `${value} times`,
    homeLabel: "Go to PIGER home",
    admin: "Admin",
    logout: "Log out",
    workspaceLabel: "WORKSPACE",
    headline: (name) => [`${name},`, "continue your conversion work."],
    workspaceDescription:
      "Check your plan, sessions, and account details in one place. Work history and team review links will connect here next.",
    summary: {
      currentPlan: "Current plan",
      paymentStatus: "Payment status",
      psdRemaining: "PSD left",
      loginMethod: "Login method",
      activeSessions: "Active sessions",
      activeSessionsValue: (value) => `${value}`,
    },
    account: { title: "Account info", email: "Email", joinedAt: "Joined", billingManage: "Manage billing" },
    unknown: "Checking",
    unlimitedCount: "Unlimited",
    paddleCheck: "Check in Paddle",
    freePlan: "Free plan",
    usage: {
      sectionLabel: "PSD USAGE",
      title: "PSD creation usage",
      description: "When PSD creation succeeds in the plugin, the generated PSD file count is recorded in the web DB.",
      webBasis: "Web basis",
      currentMember: "CURRENT MEMBER",
      currentMemberHelp: "The membership type currently applied to this account.",
      remaining: "REMAINING",
      used: "USED",
      reset: "RESET",
      unlimited: "You can use this without a limit.",
      remainingHelp: (period, limit) => `Remaining out of ${limit} for ${period}.`,
      usedHelp: (period) => `PSD creation count used ${period}.`,
      resetHelp: "The next period starts on Korea Standard Time.",
      noReset: "No reset",
      noResetHelp: "During beta, free accounts can use PSD creation without a limit.",
      policyTitle: "PSD count policy when plans change",
      policyNote:
        "During beta, free accounts can create unlimited PSDs. Paid monthly plans deduct by month, and paid yearly plans deduct by year.",
      policyItems: [
        "During beta, free account PSD creation is not deducted.",
        "Monthly Basic/Pro plans share this month's usage, and yearly Basic/Pro plans share this year's usage.",
        "Upgrades apply immediately, and downgrades apply from the next billing date.",
        "If a ZIP generates 10 PSD files, 10 uses are deducted.",
        "Reserved deductions are restored if the PSD does not become downloadable.",
        "Payment failures have a 3-day grace period; refunds and chargebacks revoke access immediately.",
        "Remaining uses do not roll over, and resets follow Korea Standard Time.",
      ],
    },
    billing: {
      sectionLabel: "BILLING",
      title: "Billing and subscription",
      description:
        "Card changes, cancellation, and payment history are handled directly in Paddle's secure portal. You can manage billing without a separate support request.",
      currentPlan: "CURRENT PLAN",
      currentPlanHelp: "The plan currently applied to your account.",
      nextBilling: "NEXT BILLING",
      nextBillingHelp: "Your next billing date or renewal state.",
      customerPortal: "CUSTOMER PORTAL",
      connected: "Connected",
      pending: "Pending",
      connectedHelp: "You can open the Paddle portal.",
      pendingHelp: "This connects automatically after paid checkout.",
      overviewTitle: "View payments",
      overviewDescription: "Check receipts and payment history.",
      updatePaymentTitle: "Change card",
      updatePaymentDescription: "Update the saved payment method.",
      cancelTitle: "Cancel subscription",
      cancelDescription: "Open Paddle's subscription cancellation screen.",
      noSubscriptionTitle: "No subscription to manage yet.",
      noSubscriptionDescription:
        "Choose Basic or Pro, and after checkout you can change cards or cancel directly from this area.",
      viewPricing: "See pricing",
    },
  },
  ja: {
    dateLocale: "ja-JP",
    planLabels: {
      free: "Free",
      basic: "Basic",
      basic_yearly: "Basic 年間",
      pro: "Pro",
      pro_yearly: "Pro 年間",
      admin: "管理者",
    },
    statusLabels: {
      active: "有効",
      free: "無料",
      inactive: "無効",
      on_trial: "トライアル中",
      trialing: "トライアル中",
      past_due: "支払い確認が必要",
      payment_failed: "支払い失敗",
      paused: "一時停止",
      canceled: "キャンセル済み",
      refunded: "返金済み",
      chargeback: "チャージバック",
      chargeback_warning: "チャージバック確認が必要",
    },
    periods: { lifetime: "全期間", day: "今日", month: "今月", year: "今年" },
    count: (value) => `${value}回`,
    homeLabel: "PIGERホームへ移動",
    admin: "管理者",
    logout: "ログアウト",
    workspaceLabel: "WORKSPACE",
    headline: (name) => [`${name}さん、`, "変換作業を続けましょう。"],
    workspaceDescription:
      "プラン、セッション、アカウント情報を一か所で確認できます。作業履歴とチームレビューリンクも今後ここに接続します。",
    summary: {
      currentPlan: "現在のプラン",
      paymentStatus: "決済状態",
      psdRemaining: "PSD残数",
      loginMethod: "ログイン方式",
      activeSessions: "有効セッション",
      activeSessionsValue: (value) => `${value}件`,
    },
    account: { title: "アカウント情報", email: "メール", joinedAt: "登録日", billingManage: "決済管理" },
    unknown: "確認中",
    unlimitedCount: "無制限",
    paddleCheck: "Paddleで確認",
    freePlan: "無料プラン",
    usage: {
      sectionLabel: "PSD USAGE",
      title: "PSD作成の使用量",
      description: "プラグインでPSD作成が成功すると、生成されたPSDファイル数がWeb DBに記録されます。",
      webBasis: "Web基準",
      currentMember: "CURRENT MEMBER",
      currentMemberHelp: "現在このアカウントに適用されている会員区分です。",
      remaining: "REMAINING",
      used: "USED",
      reset: "RESET",
      unlimited: "制限なく使用できます。",
      remainingHelp: (period, limit) => `${period}基準で${limit}のうち残っている回数です。`,
      usedHelp: (period) => `${period}に使用したPSD作成回数です。`,
      resetHelp: "次の期間は韓国時間基準で開始されます。",
      noReset: "リセットなし",
      noResetHelp: "ベータ期間中は無料アカウントでも制限なく利用できます。",
      policyTitle: "プラン変更時のPSD回数ポリシー",
      policyNote:
        "ベータ期間中は無料アカウントでもPSDを無制限に作成できます。有料月間は月単位、有料年間は年単位でPSDファイル数だけ差し引かれます。",
      policyItems: [
        "ベータ期間中、無料アカウントのPSD作成回数は差し引かれません。",
        "月間Basic/Proは今月の使用量を共有し、年間Basic/Proは今年の使用量を共有します。",
        "アップグレードは即時適用、ダウングレードは次回決済日から適用されます。",
        "ZIPでPSDが10個生成されると10回分を差し引きます。",
        "PSDがダウンロード可能にならない場合、予約差し引きを復元します。",
        "支払い失敗は3日間猶予、返金とチャージバックは即時回収します。",
        "残数は繰り越されず、リセットは韓国時間(KST)基準です。",
      ],
    },
    billing: {
      sectionLabel: "BILLING",
      title: "決済とサブスクリプション管理",
      description:
        "カード変更、サブスクリプション解約、決済履歴確認はPaddleの安全なポータルで直接処理されます。",
      currentPlan: "CURRENT PLAN",
      currentPlanHelp: "現在適用中の料金プランです。",
      nextBilling: "NEXT BILLING",
      nextBillingHelp: "次回決済日または更新状態です。",
      customerPortal: "CUSTOMER PORTAL",
      connected: "接続済み",
      pending: "待機中",
      connectedHelp: "Paddleポータルへ移動できます。",
      pendingHelp: "有料決済後に自動で接続されます。",
      overviewTitle: "決済履歴を見る",
      overviewDescription: "領収書と決済記録を確認します。",
      updatePaymentTitle: "カード変更",
      updatePaymentDescription: "保存済みの決済手段を変更します。",
      cancelTitle: "サブスク解約",
      cancelDescription: "Paddleの解約画面へ移動します。",
      noSubscriptionTitle: "まだ管理できるサブスクリプションはありません。",
      noSubscriptionDescription:
        "BasicまたはProを選択すると、決済完了後にここでカード変更と解約を直接処理できます。",
      viewPricing: "料金を見る",
    },
  },
  es: {
    dateLocale: "es-ES",
    planLabels: {
      free: "Free",
      basic: "Basic",
      basic_yearly: "Basic anual",
      pro: "Pro",
      pro_yearly: "Pro anual",
      admin: "Admin",
    },
    statusLabels: {
      active: "Activo",
      free: "Gratis",
      inactive: "Inactivo",
      on_trial: "En prueba",
      trialing: "En prueba",
      past_due: "Pago por revisar",
      payment_failed: "Pago fallido",
      paused: "Pausado",
      canceled: "Cancelado",
      refunded: "Reembolsado",
      chargeback: "Contracargo",
      chargeback_warning: "Revisar contracargo",
    },
    periods: { lifetime: "todo el tiempo", day: "hoy", month: "este mes", year: "este año" },
    count: (value) => `${value} veces`,
    homeLabel: "Ir al inicio de PIGER",
    admin: "Admin",
    logout: "Cerrar sesión",
    workspaceLabel: "WORKSPACE",
    headline: (name) => [`${name},`, "continúa tu trabajo de conversión."],
    workspaceDescription:
      "Consulta tu plan, sesiones e información de cuenta en un solo lugar. Próximamente conectaremos historial de trabajo y links de revisión.",
    summary: {
      currentPlan: "Plan actual",
      paymentStatus: "Estado de pago",
      psdRemaining: "PSD restantes",
      loginMethod: "Método de login",
      activeSessions: "Sesiones activas",
      activeSessionsValue: (value) => `${value}`,
    },
    account: { title: "Cuenta", email: "Email", joinedAt: "Alta", billingManage: "Gestionar pago" },
    unknown: "Revisando",
    unlimitedCount: "Ilimitado",
    paddleCheck: "Revisar en Paddle",
    freePlan: "Plan gratis",
    usage: {
      sectionLabel: "PSD USAGE",
      title: "Uso de creación PSD",
      description: "Cuando la creación PSD funciona en el plugin, se registra en la DB web el número de archivos PSD generados.",
      webBasis: "Base web",
      currentMember: "CURRENT MEMBER",
      currentMemberHelp: "El tipo de membresía aplicado a esta cuenta.",
      remaining: "REMAINING",
      used: "USED",
      reset: "RESET",
      unlimited: "Puedes usarlo sin límite.",
      remainingHelp: (period, limit) => `Restante de ${limit} para ${period}.`,
      usedHelp: (period) => `Creaciones PSD usadas ${period}.`,
      resetHelp: "El siguiente periodo empieza según la hora de Corea.",
      noReset: "Sin reset",
      noResetHelp: "Durante la beta, las cuentas gratis pueden usar creación PSD sin límite.",
      policyTitle: "Política de usos PSD al cambiar de plan",
      policyNote:
        "Durante la beta, las cuentas gratis pueden crear PSD sin límite. Los planes mensuales descuentan por mes y los anuales por año.",
      policyItems: [
        "Durante la beta, las creaciones PSD de cuentas gratis no se descuentan.",
        "Basic/Pro mensual comparte el uso del mes; Basic/Pro anual comparte el uso del año.",
        "Los upgrades se aplican de inmediato y los downgrades desde la próxima fecha de pago.",
        "Si un ZIP genera 10 PSD, se descuentan 10 usos.",
        "Si el PSD no llega a estar descargable, se restaura el descuento reservado.",
        "Los fallos de pago tienen 3 días de gracia; reembolsos y contracargos revocan acceso de inmediato.",
        "Los usos restantes no se acumulan y el reset sigue la hora de Corea.",
      ],
    },
    billing: {
      sectionLabel: "BILLING",
      title: "Pagos y suscripción",
      description:
        "Cambios de tarjeta, cancelación e historial de pagos se gestionan directamente en el portal seguro de Paddle.",
      currentPlan: "CURRENT PLAN",
      currentPlanHelp: "El plan aplicado actualmente.",
      nextBilling: "NEXT BILLING",
      nextBillingHelp: "La próxima fecha de pago o estado de renovación.",
      customerPortal: "CUSTOMER PORTAL",
      connected: "Conectado",
      pending: "Pendiente",
      connectedHelp: "Puedes abrir el portal de Paddle.",
      pendingHelp: "Se conecta automáticamente después del pago.",
      overviewTitle: "Ver pagos",
      overviewDescription: "Revisa recibos e historial de pago.",
      updatePaymentTitle: "Cambiar tarjeta",
      updatePaymentDescription: "Actualiza el método de pago guardado.",
      cancelTitle: "Cancelar suscripción",
      cancelDescription: "Abre la pantalla de cancelación de Paddle.",
      noSubscriptionTitle: "Aún no hay suscripción que gestionar.",
      noSubscriptionDescription:
        "Elige Basic o Pro y, después del pago, podrás cambiar tarjeta o cancelar desde esta zona.",
      viewPricing: "Ver precios",
    },
  },
  "pt-br": {
    dateLocale: "pt-BR",
    planLabels: {
      free: "Free",
      basic: "Basic",
      basic_yearly: "Basic anual",
      pro: "Pro",
      pro_yearly: "Pro anual",
      admin: "Admin",
    },
    statusLabels: {
      active: "Ativo",
      free: "Grátis",
      inactive: "Inativo",
      on_trial: "Em teste",
      trialing: "Em teste",
      past_due: "Pagamento pendente",
      payment_failed: "Pagamento falhou",
      paused: "Pausado",
      canceled: "Cancelado",
      refunded: "Reembolsado",
      chargeback: "Chargeback",
      chargeback_warning: "Revisar chargeback",
    },
    periods: { lifetime: "todo o período", day: "hoje", month: "este mês", year: "este ano" },
    count: (value) => `${value} vezes`,
    homeLabel: "Ir para a home do PIGER",
    admin: "Admin",
    logout: "Sair",
    workspaceLabel: "WORKSPACE",
    headline: (name) => [`${name},`, "continue seu trabalho de conversão."],
    workspaceDescription:
      "Veja plano, sessões e dados da conta em um só lugar. Histórico de trabalho e links de revisão serão conectados aqui depois.",
    summary: {
      currentPlan: "Plano atual",
      paymentStatus: "Status do pagamento",
      psdRemaining: "PSD restantes",
      loginMethod: "Login",
      activeSessions: "Sessões ativas",
      activeSessionsValue: (value) => `${value}`,
    },
    account: { title: "Conta", email: "Email", joinedAt: "Entrada", billingManage: "Gerenciar pagamento" },
    unknown: "Verificando",
    unlimitedCount: "Ilimitado",
    paddleCheck: "Ver no Paddle",
    freePlan: "Plano grátis",
    usage: {
      sectionLabel: "PSD USAGE",
      title: "Uso de criação PSD",
      description: "Quando a criação PSD funciona no plugin, a quantidade de arquivos PSD gerados é registrada no DB web.",
      webBasis: "Base web",
      currentMember: "CURRENT MEMBER",
      currentMemberHelp: "O tipo de conta aplicado atualmente.",
      remaining: "REMAINING",
      used: "USED",
      reset: "RESET",
      unlimited: "Você pode usar sem limite.",
      remainingHelp: (period, limit) => `Restante de ${limit} para ${period}.`,
      usedHelp: (period) => `Criações PSD usadas ${period}.`,
      resetHelp: "O próximo período começa pelo horário da Coreia.",
      noReset: "Sem reset",
      noResetHelp: "Durante o beta, contas grátis podem usar criação PSD sem limite.",
      policyTitle: "Política de usos PSD ao mudar de plano",
      policyNote:
        "Durante o beta, contas grátis podem criar PSDs sem limite. Planos mensais pagos descontam por mês, e planos anuais pagos descontam por ano.",
      policyItems: [
        "Durante o beta, criações PSD de contas grátis não são descontadas.",
        "Basic/Pro mensal compartilha o uso do mês; Basic/Pro anual compartilha o uso do ano.",
        "Upgrades aplicam imediatamente, e downgrades aplicam no próximo pagamento.",
        "Se um ZIP gerar 10 PSDs, 10 usos são descontados.",
        "Se o PSD não ficar disponível para download, o desconto reservado é restaurado.",
        "Falha de pagamento tem 3 dias de tolerância; reembolso e chargeback removem acesso imediatamente.",
        "Usos restantes não acumulam e o reset segue o horário da Coreia.",
      ],
    },
    billing: {
      sectionLabel: "BILLING",
      title: "Pagamento e assinatura",
      description:
        "Troca de cartão, cancelamento e histórico de pagamentos são gerenciados diretamente no portal seguro da Paddle.",
      currentPlan: "CURRENT PLAN",
      currentPlanHelp: "O plano aplicado atualmente.",
      nextBilling: "NEXT BILLING",
      nextBillingHelp: "Próxima cobrança ou estado de renovação.",
      customerPortal: "CUSTOMER PORTAL",
      connected: "Conectado",
      pending: "Pendente",
      connectedHelp: "Você pode abrir o portal da Paddle.",
      pendingHelp: "Conecta automaticamente após o pagamento.",
      overviewTitle: "Ver pagamentos",
      overviewDescription: "Veja recibos e histórico.",
      updatePaymentTitle: "Trocar cartão",
      updatePaymentDescription: "Atualize o método de pagamento salvo.",
      cancelTitle: "Cancelar assinatura",
      cancelDescription: "Abre a tela de cancelamento da Paddle.",
      noSubscriptionTitle: "Ainda não há assinatura para gerenciar.",
      noSubscriptionDescription:
        "Escolha Basic ou Pro e, depois do pagamento, você poderá trocar cartão ou cancelar por aqui.",
      viewPricing: "Ver preços",
    },
  },
}

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`material-icons-round select-none ${className}`} aria-hidden="true">
      {name}
    </span>
  )
}

function PigerLogo({ className = "" }: { className?: string }) {
  return <img src="/assets/piger-wordmark.svg" alt="PIGER" className={className} width={100} height={20} />
}

function getPlanLabel(plan: string, copy: DashboardCopy) {
  return copy.planLabels[plan] || plan.toUpperCase()
}

function getStatusLabel(status: string, copy: DashboardCopy) {
  return copy.statusLabels[status] || status.toUpperCase()
}

function formatDate(value: string | null, copy: DashboardCopy) {
  if (!value) {
    return null
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat(copy.dateLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

function formatResetDate(value: string | null, copy: DashboardCopy) {
  if (!value) {
    return copy.usage.noReset
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return copy.unknown
  }

  return new Intl.DateTimeFormat(copy.dateLocale, {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function formatUsageCount(value: number | null, copy: DashboardCopy) {
  return value === null ? copy.unlimitedCount : copy.count(value)
}

function formatPsdPeriod(period: string, copy: DashboardCopy) {
  if (period === "lifetime") {
    return copy.periods.lifetime
  }
  if (period === "day") {
    return copy.periods.day
  }
  if (period === "year") {
    return copy.periods.year
  }
  return copy.periods.month
}

function getStatusTone(status: string) {
  if (status === "active" || status === "on_trial" || status === "trialing") {
    return "bg-[#eaf3ff] text-[#005bff] ring-[#c8ddff]"
  }

  if (status === "past_due" || status === "paused") {
    return "bg-[#fff5dd] text-[#9a5a00] ring-[#ffe0a3]"
  }

  if (status === "canceled" || status === "inactive") {
    return "bg-[#fff0f0] text-[#c22f2f] ring-[#ffd1d1]"
  }

  return "bg-[#f1f3f6] text-[#5f6670] ring-[#dde3eb]"
}

async function getDashboardLocale(): Promise<LocaleCode> {
  const requestHeaders = await headers()
  const headerLocale = requestHeaders.get("x-pigma-locale")
  if (isLocaleCode(headerLocale)) {
    return headerLocale
  }

  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get("pigma-locale")?.value
  return isLocaleCode(cookieLocale) ? cookieLocale : "ko"
}

function PortalButton({
  action,
  icon,
  title,
  description,
  tone = "default",
}: {
  action: "overview" | "update-payment" | "cancel"
  icon: string
  title: string
  description: string
  tone?: "default" | "danger"
}) {
  const toneClass =
    tone === "danger"
      ? "border-[#ffd7d7] bg-[#fff7f7] text-[#c22f2f] hover:border-[#ffb8b8] hover:bg-[#fff0f0]"
      : "border-[#e3e8ef] bg-white text-[#050505] hover:border-[#c9d8ef] hover:bg-[#f7fbff]"

  return (
    <form action="/api/billing/portal" method="post">
      <input type="hidden" name="action" value={action} />
      <button
        className={`flex min-h-[92px] w-full items-start gap-4 rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 ${toneClass}`}
      >
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#050505] text-white">
          <MaterialIcon name={icon} className="text-[22px]" />
        </span>
        <span>
          <span className="block text-[16px] font-black">{title}</span>
          <span className="mt-1 block text-sm font-bold leading-6 text-[#6b7280]">{description}</span>
        </span>
      </button>
    </form>
  )
}

export default async function DashboardPage() {
  const locale = await getDashboardLocale()
  const copy = dashboardCopy[locale]
  const homeHref = LOCALE_PATHS[locale]
  const pricingHref = `${homeHref}#pricing`
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const stats = getUserStats(user.id)
  const psdUsage = getPsdUsage(user)
  const joinedAt = formatDate(user.createdAt, copy) || copy.unknown
  const renewsAt = formatDate(user.planRenewsAt, copy)
  const hasBillingProfile = Boolean(user.billingCustomerId || user.billingPortalUrl || process.env.PADDLE_CUSTOMER_PORTAL_URL)
  const hasPaidPlan = user.plan !== "free" || Boolean(user.billingSubscriptionId)
  const nextBillingLabel = renewsAt || (hasPaidPlan ? copy.paddleCheck : copy.freePlan)
  const isAdmin = isAdminUser(user)
  const psdPeriodLabel = formatPsdPeriod(psdUsage.period, copy)
  const psdRemainingLabel = formatUsageCount(psdUsage.remaining, copy)
  const psdLimitLabel = formatUsageCount(psdUsage.limit, copy)
  const psdResetLabel = formatResetDate(psdUsage.resetsAt, copy)
  const psdResetHelp = psdUsage.period === "lifetime" ? copy.usage.noResetHelp : copy.usage.resetHelp
  const headline = copy.headline(user.name)

  const summaryItems = [
    [copy.summary.currentPlan, getPlanLabel(user.plan, copy), "workspace_premium"],
    [copy.summary.paymentStatus, getStatusLabel(user.planStatus, copy), "receipt_long"],
    [copy.summary.psdRemaining, psdRemainingLabel, "counter_4"],
    [copy.summary.loginMethod, user.provider.toUpperCase(), "verified_user"],
    [copy.summary.activeSessions, copy.summary.activeSessionsValue(stats.activeSessions), "key"],
  ]

  return (
    <main className="min-h-screen bg-[#f6f7f9] px-6 py-8 text-[#050505] sm:px-10">
      <div className="mx-auto max-w-[1120px]">
        <header className="flex items-center justify-between rounded-2xl bg-white px-6 py-5 shadow-[0_14px_40px_rgba(15,24,42,0.05)] ring-1 ring-[#e7ecf3]">
          <a href={homeHref} aria-label={copy.homeLabel}>
            <PigerLogo className="h-[18px] w-auto" />
          </a>
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <a
                href="/admin"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#eef5ff] px-5 text-sm font-black text-[#005bff] transition hover:-translate-y-0.5 hover:bg-[#ddecff]"
              >
                {copy.admin}
                <MaterialIcon name="admin_panel_settings" className="text-[17px]" />
              </a>
            ) : null}
            <form action={logoutAction}>
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#050505] px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#1c1c1c]">
                {copy.logout}
                <MaterialIcon name="logout" className="text-[17px]" />
              </button>
            </form>
          </div>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl bg-white p-8 shadow-[0_18px_40px_rgba(15,24,42,0.06)] ring-1 ring-[#e7ecf3] sm:p-10">
            <p className="text-sm font-black tracking-[0.18em] text-[#005bff]">{copy.workspaceLabel}</p>
            <h1 className="mt-5 text-[36px] font-black leading-tight sm:text-[52px]">
              {headline[0]}
              <br />
              {headline[1]}
            </h1>
            <p className="mt-5 max-w-[620px] text-[16px] leading-7 text-[#60656b]">
              {copy.workspaceDescription}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {summaryItems.map(([label, value, icon]) => (
                <div key={label} className="rounded-xl bg-[#f7f9fc] p-5 ring-1 ring-[#e7ecf3]">
                  <MaterialIcon name={icon} className="text-[22px] text-[#005bff]" />
                  <p className="mt-4 text-xs font-black text-[#7a828b]">{label}</p>
                  <p className="mt-1 text-[22px] font-black text-[#050505]">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl bg-[#050505] p-7 text-white shadow-[0_18px_40px_rgba(15,24,42,0.12)]">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="size-12 rounded-full bg-white object-cover ring-2 ring-white/20"
              />
            ) : (
              <div className="inline-flex size-12 items-center justify-center rounded-xl bg-white text-[#005bff]">
                <MaterialIcon name="person" className="text-[24px]" />
              </div>
            )}
            <h2 className="mt-6 text-[26px] font-black">{copy.account.title}</h2>
            <dl className="mt-6 grid gap-4 text-sm">
              <div className="rounded-xl bg-white/[0.07] p-4">
                <dt className="font-black text-white/45">{copy.account.email}</dt>
                <dd className="mt-1 break-words font-bold">{user.email}</dd>
              </div>
              <div className="rounded-xl bg-white/[0.07] p-4">
                <dt className="font-black text-white/45">{copy.account.joinedAt}</dt>
                <dd className="mt-1 font-bold">{joinedAt}</dd>
              </div>
            </dl>
            <a
              href="#billing"
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-[#050505] transition hover:-translate-y-0.5 hover:bg-[#eef5ff]"
            >
              {copy.account.billingManage}
              <MaterialIcon name="south" className="text-[17px]" />
            </a>
          </aside>
        </section>

        <section
          id="usage"
          className="mt-6 rounded-2xl bg-white p-7 shadow-[0_18px_40px_rgba(15,24,42,0.06)] ring-1 ring-[#e7ecf3] sm:p-8"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-black tracking-[0.18em] text-[#005bff]">{copy.usage.sectionLabel}</p>
              <h2 className="mt-3 text-[30px] font-black sm:text-[38px]">{copy.usage.title}</h2>
              <p className="mt-3 max-w-[620px] text-[15px] leading-7 text-[#60656b]">
                {copy.usage.description}
              </p>
            </div>
            <span className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-[#eef5ff] px-4 text-sm font-black text-[#005bff] ring-1 ring-[#c8ddff]">
              <MaterialIcon name="database" className="text-[17px]" />
              {copy.usage.webBasis}
            </span>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-[#f7f9fc] p-5 ring-1 ring-[#e7ecf3]">
              <p className="text-xs font-black tracking-[0.14em] text-[#7a828b]">{copy.usage.currentMember}</p>
              <p className="mt-3 text-[28px] font-black">{getPlanLabel(psdUsage.plan, copy)}</p>
              <p className="mt-1 text-sm font-bold text-[#60656b]">{copy.usage.currentMemberHelp}</p>
            </div>
            <div className="rounded-2xl bg-[#f7f9fc] p-5 ring-1 ring-[#e7ecf3]">
              <p className="text-xs font-black tracking-[0.14em] text-[#7a828b]">{copy.usage.remaining}</p>
              <p className="mt-3 text-[30px] font-black">{psdRemainingLabel}</p>
              <p className="mt-1 text-sm font-bold text-[#60656b]">
                {psdUsage.unlimited ? copy.usage.unlimited : copy.usage.remainingHelp(psdPeriodLabel, psdLimitLabel)}
              </p>
            </div>
            <div className="rounded-2xl bg-[#f7f9fc] p-5 ring-1 ring-[#e7ecf3]">
              <p className="text-xs font-black tracking-[0.14em] text-[#7a828b]">{copy.usage.used}</p>
              <p className="mt-3 text-[30px] font-black">{formatUsageCount(psdUsage.used, copy)}</p>
              <p className="mt-1 text-sm font-bold text-[#60656b]">{copy.usage.usedHelp(psdPeriodLabel)}</p>
            </div>
            <div className="rounded-2xl bg-[#f7f9fc] p-5 ring-1 ring-[#e7ecf3]">
              <p className="text-xs font-black tracking-[0.14em] text-[#7a828b]">{copy.usage.reset}</p>
              <p className="mt-3 text-[24px] font-black">{psdResetLabel}</p>
              <p className="mt-1 text-sm font-bold text-[#60656b]">{psdResetHelp}</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-[#f7fbff] p-5 ring-1 ring-[#d6e7ff]">
            <div className="flex items-start gap-3">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#005bff] ring-1 ring-[#c8ddff]">
                <MaterialIcon name="rule" className="text-[18px]" />
              </span>
              <div>
                <p className="text-sm font-black text-[#005bff]">{copy.usage.policyTitle}</p>
                <p className="mt-2 text-sm font-bold leading-6 text-[#4f5b6b]">{copy.usage.policyNote}</p>
                <ul className="mt-3 grid gap-2 text-sm font-bold leading-6 text-[#60656b] md:grid-cols-3">
                  {copy.usage.policyItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section
          id="billing"
          className="mt-6 rounded-2xl bg-white p-7 shadow-[0_18px_40px_rgba(15,24,42,0.06)] ring-1 ring-[#e7ecf3] sm:p-8"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-black tracking-[0.18em] text-[#005bff]">{copy.billing.sectionLabel}</p>
              <h2 className="mt-3 text-[30px] font-black sm:text-[38px]">{copy.billing.title}</h2>
              <p className="mt-3 max-w-[620px] text-[15px] leading-7 text-[#60656b]">
                {copy.billing.description}
              </p>
            </div>
            <span
              className={`inline-flex h-10 shrink-0 items-center justify-center rounded-full px-4 text-sm font-black ring-1 ${getStatusTone(
                user.planStatus,
              )}`}
            >
              {getStatusLabel(user.planStatus, copy)}
            </span>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-[#f7f9fc] p-5 ring-1 ring-[#e7ecf3]">
              <p className="text-xs font-black tracking-[0.14em] text-[#7a828b]">{copy.billing.currentPlan}</p>
              <p className="mt-3 text-[30px] font-black">{getPlanLabel(user.plan, copy)}</p>
              <p className="mt-1 text-sm font-bold text-[#60656b]">{copy.billing.currentPlanHelp}</p>
            </div>
            <div className="rounded-2xl bg-[#f7f9fc] p-5 ring-1 ring-[#e7ecf3]">
              <p className="text-xs font-black tracking-[0.14em] text-[#7a828b]">{copy.billing.nextBilling}</p>
              <p className="mt-3 text-[24px] font-black">{nextBillingLabel}</p>
              <p className="mt-1 text-sm font-bold text-[#60656b]">{copy.billing.nextBillingHelp}</p>
            </div>
            <div className="rounded-2xl bg-[#f7f9fc] p-5 ring-1 ring-[#e7ecf3]">
              <p className="text-xs font-black tracking-[0.14em] text-[#7a828b]">{copy.billing.customerPortal}</p>
              <p className="mt-3 text-[24px] font-black">{hasBillingProfile ? copy.billing.connected : copy.billing.pending}</p>
              <p className="mt-1 text-sm font-bold text-[#60656b]">
                {hasBillingProfile ? copy.billing.connectedHelp : copy.billing.pendingHelp}
              </p>
            </div>
          </div>

          {hasBillingProfile ? (
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <PortalButton
                action="overview"
                icon="receipt_long"
                title={copy.billing.overviewTitle}
                description={copy.billing.overviewDescription}
              />
              <PortalButton
                action="update-payment"
                icon="credit_card"
                title={copy.billing.updatePaymentTitle}
                description={copy.billing.updatePaymentDescription}
              />
              <PortalButton
                action="cancel"
                icon="block"
                title={copy.billing.cancelTitle}
                description={copy.billing.cancelDescription}
                tone="danger"
              />
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-[#dbe6f5] bg-[#f7fbff] p-5">
              <p className="text-[18px] font-black">{copy.billing.noSubscriptionTitle}</p>
              <p className="mt-2 text-sm font-bold leading-6 text-[#60656b]">
                {copy.billing.noSubscriptionDescription}
              </p>
              <a
                href={pricingHref}
                className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#005bff] px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#004de0]"
              >
                {copy.billing.viewPricing}
                <MaterialIcon name="arrow_forward" className="text-[17px]" />
              </a>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
