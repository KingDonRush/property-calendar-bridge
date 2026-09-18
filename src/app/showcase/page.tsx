import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function ShowcasePage() {
    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
            <div className="max-w-4xl mx-auto space-y-12">
                <header className="text-center">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                        Showcase de Componentes
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Biblioteca de componentes atômicos com suporte a data-ui
                    </p>
                </header>

                {/* Buttons */}
                <Card data-ui="showcase-buttons">
                    <CardHeader>
                        <CardTitle>Buttons</CardTitle>
                        <CardDescription>Variantes: default, destructive, outline, ghost</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-4">
                        <Button data-ui="btn-default">Default</Button>
                        <Button variant="destructive" data-ui="btn-destructive">Destructive</Button>
                        <Button variant="outline" data-ui="btn-outline">Outline</Button>
                        <Button variant="ghost" data-ui="btn-ghost">Ghost</Button>
                    </CardContent>
                    <CardFooter className="text-sm text-slate-500">
                        Tamanhos: default, sm, lg, icon
                    </CardFooter>
                </Card>

                {/* Badges */}
                <Card data-ui="showcase-badges">
                    <CardHeader>
                        <CardTitle>Badges</CardTitle>
                        <CardDescription>Indicadores de status</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-4">
                        <Badge data-ui="badge-default">Default</Badge>
                        <Badge variant="secondary" data-ui="badge-secondary">Secondary</Badge>
                        <Badge variant="success" data-ui="badge-success">Success</Badge>
                        <Badge variant="warning" data-ui="badge-warning">Warning</Badge>
                        <Badge variant="destructive" data-ui="badge-destructive">Destructive</Badge>
                        <Badge variant="outline" data-ui="badge-outline">Outline</Badge>
                    </CardContent>
                </Card>

                {/* Form */}
                <Card data-ui="showcase-form">
                    <CardHeader>
                        <CardTitle>Formulário</CardTitle>
                        <CardDescription>Input e Label</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" data-ui="label-email">Email</Label>
                            <Input id="email" type="email" placeholder="seu@email.com" data-ui="input-email" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" data-ui="label-password">Senha</Label>
                            <Input id="password" type="password" placeholder="••••••••" data-ui="input-password" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button data-ui="btn-submit">Entrar</Button>
                    </CardFooter>
                </Card>

                {/* Table */}
                <Card data-ui="showcase-table">
                    <CardHeader>
                        <CardTitle>Tabela</CardTitle>
                        <CardDescription>Componentes de tabela estilizados</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table data-ui="table-properties">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Propriedade</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Reservas</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow data-ui="row-casa-praia">
                                    <TableCell>Casa da Praia</TableCell>
                                    <TableCell><Badge variant="success">Ativo</Badge></TableCell>
                                    <TableCell>12</TableCell>
                                </TableRow>
                                <TableRow data-ui="row-apto-centro">
                                    <TableCell>Apartamento Centro</TableCell>
                                    <TableCell><Badge variant="warning">Pendente</Badge></TableCell>
                                    <TableCell>8</TableCell>
                                </TableRow>
                                <TableRow data-ui="row-chale-serra">
                                    <TableCell>Chalé da Serra</TableCell>
                                    <TableCell><Badge variant="secondary">Inativo</Badge></TableCell>
                                    <TableCell>0</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
