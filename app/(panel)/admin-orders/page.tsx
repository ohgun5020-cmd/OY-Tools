import { AlertTriangle, Bot, CheckCircle2, Clock3, Eye, Heart, MessageCircle, Repeat2, ShieldCheck, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const targetProfile = "https://www.instagram.com/blueblurbutter"

const automationChecks = [
  {
    title: "새 게시글 감지",
    status: "조건부 가능",
    icon: Clock3,
    description: "공식 API로는 내 권한이 있는 프로 계정 미디어를 주기적으로 조회하는 방식이 현실적입니다.",
  },
  {
    title: "자동 조회수",
    status: "서비스 의존",
    icon: Eye,
    description: "SMM 패널에 해당 게시글 URL을 받는 조회수 서비스가 있으면 주문 후보 생성은 가능합니다.",
  },
  {
    title: "자동 좋아요",
    status: "승인 권장",
    icon: Heart,
    description: "실제 자동 실행은 계정 리스크가 있으므로 새 주문을 만들고 수동 승인 후 실행하는 방식이 안전합니다.",
  },
  {
    title: "자동 팔로워",
    status: "게시글과 별도",
    icon: Users,
    description: "팔로워는 게시글이 아니라 프로필 대상 주문이라 새 게시글 감지와 직접 연결되지는 않습니다.",
  },
  {
    title: "자동 댓글",
    status: "주의 필요",
    icon: MessageCircle,
    description: "댓글 문구 품질과 반복 패턴 리스크가 커서 템플릿 검수와 수동 승인 흐름이 필요합니다.",
  },
  {
    title: "리포스트/노출/도달/방문",
    status: "서비스 의존",
    icon: Repeat2,
    description: "외부 패널이 해당 상품을 제공하고 게시글 URL 주문을 지원해야 자동 주문 후보로 만들 수 있습니다.",
  },
]

export default function AdminOrdersPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-medium text-primary">자동화 검토</p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">관리자 오더</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          새 게시글 감지 후 주문 후보를 만들고, 관리자가 확인한 뒤 실행하는 흐름을 준비합니다.
        </p>
      </div>

      <Card className="panel-card">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>감지 대상</CardTitle>
              <CardDescription>현재 검토 중인 Instagram 프로필입니다.</CardDescription>
            </div>
            <Badge variant="outline" className="w-fit rounded-sm border-primary/35 bg-primary/10 text-primary">
              자동 실행 전 검수 필요
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/70 bg-secondary/35 p-4">
            <p className="text-xs text-muted-foreground">Profile URL</p>
            <p className="mt-1 break-all font-mono text-sm">{targetProfile}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {automationChecks.map((item) => (
          <Card key={item.title} className="panel-card">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border/80 bg-secondary/50">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <Badge variant="outline" className="rounded-sm">
                  {item.status}
                </Badge>
              </div>
              <CardTitle className="text-base">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="panel-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              추천 구현 방식
            </CardTitle>
            <CardDescription>처음부터 완전 자동 주문보다 운영자가 승인하는 방식이 좋습니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>1. Instagram 게시글 목록을 주기적으로 확인합니다.</p>
            <p>2. 새 게시글 URL을 발견하면 관리자 오더 후보를 생성합니다.</p>
            <p>3. 조회수, 좋아요, 댓글 등 미리 지정한 서비스와 수량을 자동 계산합니다.</p>
            <p>4. 관리자가 확인 후 실행 버튼을 눌러 실제 SMM 주문을 넣습니다.</p>
          </CardContent>
        </Card>

        <Card className="panel-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-300" />
              주의할 점
            </CardTitle>
            <CardDescription>공식 API 권한과 플랫폼 정책을 확인해야 합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>공식 API는 권한이 있는 프로/비즈니스 계정 중심으로 동작합니다.</p>
            <p>인사이트는 본인 또는 관리 권한이 있는 계정의 미디어에서만 안정적으로 조회할 수 있습니다.</p>
            <p>좋아요, 팔로워, 댓글 자동 증가는 비정상 활동으로 분류될 수 있어 계정 리스크가 있습니다.</p>
            <p className="flex items-center gap-2 text-emerald-200">
              <ShieldCheck className="h-4 w-4" />
              그래서 MVP는 자동 실행보다 승인형 오더 큐로 시작하는 것을 권장합니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
