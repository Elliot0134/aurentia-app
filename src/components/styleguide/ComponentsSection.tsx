import { useState } from 'react';
import ComponentShowcase from './ComponentShowcase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertCircle, CheckCircle, Info, ChevronDown, MoreVertical, Calendar } from 'lucide-react';

export default function ComponentsSection() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Components</h1>
        <p className="text-[#6b7280] text-lg">
          All UI components used throughout the Aurentia application
        </p>
      </div>

      {/* Buttons */}
      <ComponentShowcase
        id="buttons"
        title="Buttons"
        description="Button components with different variants for various use cases"
        preview={
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Primary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="link">Link Button</Button>
            <Button variant="destructive">Destructive Button</Button>
            <Button disabled>Disabled Button</Button>
            <Button size="sm">Small Button</Button>
            <Button size="lg">Large Button</Button>
          </div>
        }
        code={`import { Button } from '@/components/ui/button';

// Variants
<Button variant="default">Primary Button</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="link">Link Button</Button>
<Button variant="destructive">Destructive Button</Button>

// States
<Button disabled>Disabled Button</Button>

// Sizes
<Button size="sm">Small Button</Button>
<Button size="default">Default Button</Button>
<Button size="lg">Large Button</Button>
<Button size="icon">Icon</Button>`}
        notes="Primary button uses Aurentia orange (#ff592b). All variants support hover, active, and disabled states."
      />

      {/* Cards */}
      <ComponentShowcase
        id="cards"
        title="Cards"
        description="Card containers for displaying content"
        preview={
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description goes here</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#6b7280]">
                  This is the card content area. You can put any content here.
                </p>
              </CardContent>
              <CardFooter>
                <Button>Action</Button>
              </CardFooter>
            </Card>

            <Card className="bg-[#f4f4f5] cursor-pointer hover:bg-[#e8e8e9] transition-all">
              <CardHeader>
                <CardTitle>Clickable Card</CardTitle>
                <CardDescription>Hover to see the effect</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#6b7280]">
                  This card has hover effects for interactive use cases.
                </p>
              </CardContent>
            </Card>
          </div>
        }
        code={`import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

// Standard Card
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Clickable Card with hover effect
<Card className="bg-[#f4f4f5] cursor-pointer hover:bg-[#e8e8e9] transition-all">
  <CardContent>...</CardContent>
</Card>`}
        notes="Use white background (#ffffff) for static cards and gray background (#f4f4f5) for clickable cards."
      />

      {/* Form Inputs */}
      <ComponentShowcase
        id="forms"
        title="Form Inputs"
        description="Input fields, textareas, and form controls"
        preview={
          <div className="space-y-6 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="text-input">Quel est votre nom ?</Label>
              <Input id="text-input" placeholder="James" className="h-14 text-lg rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-input">Quelle est votre adresse email ?</Label>
              <Input id="email-input" type="email" placeholder="james@example.com" className="h-14 text-lg rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="textarea">Parlez-nous de votre projet</Label>
              <Textarea id="textarea" placeholder="Décrivez votre projet en quelques mots..." rows={4} className="text-lg rounded-xl" />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="checkbox" />
              <Label htmlFor="checkbox">Accept terms and conditions</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="switch" />
              <Label htmlFor="switch">Enable notifications</Label>
            </div>
          </div>
        }
        code={`import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

// Text Input
<div className="space-y-2">
  <Label htmlFor="text-input">Text Input</Label>
  <Input id="text-input" placeholder="Enter text..." />
</div>

// Textarea
<div className="space-y-2">
  <Label htmlFor="textarea">Textarea</Label>
  <Textarea id="textarea" placeholder="Enter text..." rows={4} />
</div>

// Checkbox
<div className="flex items-center space-x-2">
  <Checkbox id="checkbox" />
  <Label htmlFor="checkbox">Label</Label>
</div>

// Switch
<div className="flex items-center space-x-2">
  <Switch id="switch" />
  <Label htmlFor="switch">Label</Label>
</div>`}
        notes="All inputs have focus states with orange border (#ff592b). Always pair inputs with labels for accessibility."
      />

      {/* Badges */}
      <ComponentShowcase
        id="badges"
        title="Badges"
        description="Small status indicators and labels"
        preview={
          <div className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge className="bg-emerald-100 text-emerald-800">Success</Badge>
            <Badge className="bg-amber-100 text-amber-800">Warning</Badge>
            <Badge className="bg-blue-100 text-blue-800">Info</Badge>
          </div>
        }
        code={`import { Badge } from '@/components/ui/badge';

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>

// Custom colors
<Badge className="bg-emerald-100 text-emerald-800">Success</Badge>
<Badge className="bg-amber-100 text-amber-800">Warning</Badge>
<Badge className="bg-blue-100 text-blue-800">Info</Badge>`}
        notes="Use badges for status indicators, tags, and small labels. Combine with icons for better clarity."
      />

      {/* Alerts */}
      <ComponentShowcase
        id="alerts"
        title="Alerts"
        description="Alert messages for different notification types"
        preview={
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>
                This is an informational alert message.
              </AlertDescription>
            </Alert>

            <Alert className="border-emerald-500 bg-emerald-50">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <AlertTitle className="text-emerald-600">Success</AlertTitle>
              <AlertDescription className="text-emerald-700">
                Your changes have been saved successfully.
              </AlertDescription>
            </Alert>

            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Something went wrong. Please try again.
              </AlertDescription>
            </Alert>
          </div>
        }
        code={`import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, CheckCircle, AlertCircle } from 'lucide-react';

// Info Alert
<Alert>
  <Info className="h-4 w-4" />
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>Message here</AlertDescription>
</Alert>

// Success Alert
<Alert className="border-emerald-500 bg-emerald-50">
  <CheckCircle className="h-4 w-4 text-emerald-600" />
  <AlertTitle className="text-emerald-600">Success</AlertTitle>
  <AlertDescription className="text-emerald-700">Message here</AlertDescription>
</Alert>

// Error Alert
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Message here</AlertDescription>
</Alert>`}
        notes="Always include an icon and title for better scannability. Use appropriate colors for different alert types."
      />

      {/* Tabs */}
      <ComponentShowcase
        id="tabs"
        title="Tabs"
        description="Tabbed interface for organizing content"
        preview={
          <Tabs defaultValue="tab1" className="w-full">
            <TabsList>
              <TabsTrigger value="tab1">Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">Tab 2</TabsTrigger>
              <TabsTrigger value="tab3">Tab 3</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" className="p-4 border border-[#e6e6e9] rounded-lg">
              <p className="text-sm text-[#6b7280]">Content for Tab 1</p>
            </TabsContent>
            <TabsContent value="tab2" className="p-4 border border-[#e6e6e9] rounded-lg">
              <p className="text-sm text-[#6b7280]">Content for Tab 2</p>
            </TabsContent>
            <TabsContent value="tab3" className="p-4 border border-[#e6e6e9] rounded-lg">
              <p className="text-sm text-[#6b7280]">Content for Tab 3</p>
            </TabsContent>
          </Tabs>
        }
        code={`import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
    <TabsTrigger value="tab3">Tab 3</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    <p>Content for Tab 1</p>
  </TabsContent>
  <TabsContent value="tab2">
    <p>Content for Tab 2</p>
  </TabsContent>
  <TabsContent value="tab3">
    <p>Content for Tab 3</p>
  </TabsContent>
</Tabs>`}
        notes="Active tab has orange underline (#ff592b). Use tabs for organizing related content that doesn't need to be visible simultaneously."
      />

      {/* Progress & Loading */}
      <ComponentShowcase
        id="progress"
        title="Progress & Loading States"
        description="Progress bars and loading skeletons"
        preview={
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Progress Bar</Label>
              <Progress value={66} className="w-full" />
            </div>

            <div className="space-y-2">
              <Label>Loading Skeleton</Label>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Card Skeleton</Label>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-3/4 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        }
        code={`import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

// Progress Bar
<Progress value={66} className="w-full" />

// Loading Skeletons
<Skeleton className="h-4 w-full" />
<Skeleton className="h-4 w-3/4" />
<Skeleton className="h-4 w-1/2" />

// Card with Skeleton
<Card>
  <CardHeader>
    <Skeleton className="h-6 w-1/2" />
    <Skeleton className="h-4 w-3/4 mt-2" />
  </CardHeader>
  <CardContent>
    <Skeleton className="h-20 w-full" />
  </CardContent>
</Card>`}
        notes="Use progress bars for determinate operations and skeletons for initial page loads."
      />

      {/* Separators */}
      <ComponentShowcase
        id="separators"
        title="Separators"
        description="Visual dividers for content sections"
        preview={
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold">Section 1</p>
              <p className="text-sm text-[#6b7280]">Content above separator</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-semibold">Section 2</p>
              <p className="text-sm text-[#6b7280]">Content below separator</p>
            </div>
            <Separator orientation="vertical" className="h-20" />
          </div>
        }
        code={`import { Separator } from '@/components/ui/separator';

// Horizontal separator (default)
<Separator />

// Vertical separator
<Separator orientation="vertical" className="h-20" />`}
        notes="Use separators to create visual breaks between content sections. Color is #e6e6e9."
      />

      {/* Modals / Dialogs */}
      <ComponentShowcase
        id="modals"
        title="Modals / Dialogs"
        description="Modal windows for focused interactions"
        preview={
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open Modal</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Make changes to your profile here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input id="name" defaultValue="John Doe" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Username
                  </Label>
                  <Input id="username" defaultValue="@johndoe" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
        code={`import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Modal</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here.
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      {/* Form content */}
    </div>
    <DialogFooter>
      <Button type="submit">Save changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`}
        notes="Modals have backdrop blur and center positioning. Use DialogFooter for action buttons."
      />

      {/* Dropdown Menus */}
      <ComponentShowcase
        id="dropdowns"
        title="Dropdown Menus"
        description="Contextual menus for actions and options"
        preview={
          <div className="flex gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Open Menu <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
        code={`import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-red-600">Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
        notes="Use DropdownMenuSeparator to group related items. Destructive actions should have red text."
      />

      {/* Select */}
      <ComponentShowcase
        id="select"
        title="Select Dropdowns"
        description="Dropdown selection inputs"
        preview={
          <div className="space-y-6 max-w-md">
            <div className="space-y-2">
              <Label>Select an option</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">Option 1</SelectItem>
                  <SelectItem value="option2">Option 2</SelectItem>
                  <SelectItem value="option3">Option 3</SelectItem>
                  <SelectItem value="option4">Option 4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fruit</Label>
              <Select defaultValue="apple">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apple">Apple</SelectItem>
                  <SelectItem value="banana">Banana</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        }
        code={`import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Choose an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>

// With default value
<Select defaultValue="apple">
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
  </SelectContent>
</Select>`}
        notes="Always pair with a Label for accessibility. Use defaultValue for pre-selected options."
      />

      {/* Tables */}
      <ComponentShowcase
        id="tables"
        title="Tables"
        description="Tabular data display"
        preview={
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">John Doe</TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>
                  </TableCell>
                  <TableCell>john@example.com</TableCell>
                  <TableCell className="text-right">$250.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Jane Smith</TableCell>
                  <TableCell>
                    <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                  </TableCell>
                  <TableCell>jane@example.com</TableCell>
                  <TableCell className="text-right">$150.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Bob Johnson</TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>
                  </TableCell>
                  <TableCell>bob@example.com</TableCell>
                  <TableCell className="text-right">$350.00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        }
        code={`import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Email</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">John Doe</TableCell>
      <TableCell>
        <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>
      </TableCell>
      <TableCell>john@example.com</TableCell>
      <TableCell className="text-right">$250.00</TableCell>
    </TableRow>
  </TableBody>
</Table>`}
        notes="Wrap tables in a border rounded-lg container. Use TableHead with text-right for numeric columns."
      />

      {/* Tooltips */}
      <ComponentShowcase
        id="tooltips"
        title="Tooltips"
        description="Contextual information on hover"
        preview={
          <TooltipProvider>
            <div className="flex gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover me</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This is a helpful tooltip</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Additional information here</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        }
        code={`import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>This is a helpful tooltip</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>`}
        notes="Wrap your app or component tree with TooltipProvider. Use tooltips for additional context, not essential information."
      />

      {/* Popovers */}
      <ComponentShowcase
        id="popovers"
        title="Popovers"
        description="Rich content displayed in a floating container"
        preview={
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Open Popover
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Dimensions</h4>
                <p className="text-sm text-[#6b7280]">
                  Set the dimensions for the layer.
                </p>
                <div className="grid gap-2">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="width">Width</Label>
                    <Input id="width" defaultValue="100%" className="col-span-2 h-8" />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="height">Height</Label>
                    <Input id="height" defaultValue="25px" className="col-span-2 h-8" />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        }
        code={`import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open Popover</Button>
  </PopoverTrigger>
  <PopoverContent className="w-80">
    <div className="space-y-2">
      <h4 className="font-semibold text-sm">Title</h4>
      <p className="text-sm text-[#6b7280]">Description</p>
      {/* Content */}
    </div>
  </PopoverContent>
</Popover>`}
        notes="Use popovers for richer content than tooltips. Set width with className on PopoverContent."
      />

      {/* Accordion */}
      <ComponentShowcase
        id="accordion"
        title="Accordion"
        description="Expandable content sections"
        preview={
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is Aurentia?</AccordionTrigger>
              <AccordionContent>
                Aurentia is a multi-tenant platform for project management and entrepreneurship support.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How do I create a project?</AccordionTrigger>
              <AccordionContent>
                Navigate to the dashboard and click on "Create New Project" button.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Can I collaborate with others?</AccordionTrigger>
              <AccordionContent>
                Yes, you can invite team members and collaborate on projects in real-time.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        }
        code={`import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Question 1?</AccordionTrigger>
    <AccordionContent>
      Answer to question 1.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Question 2?</AccordionTrigger>
    <AccordionContent>
      Answer to question 2.
    </AccordionContent>
  </AccordionItem>
</Accordion>`}
        notes="Use type='single' for one item at a time, or type='multiple' for multiple items. Add collapsible prop to allow closing."
      />

      {/* Radio Groups */}
      <ComponentShowcase
        id="radio"
        title="Radio Groups"
        description="Single selection from multiple options"
        preview={
          <RadioGroup defaultValue="option1" className="space-y-3">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option1" id="r1" />
              <Label htmlFor="r1">Option 1</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option2" id="r2" />
              <Label htmlFor="r2">Option 2</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option3" id="r3" />
              <Label htmlFor="r3">Option 3</Label>
            </div>
          </RadioGroup>
        }
        code={`import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

<RadioGroup defaultValue="option1">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option1" id="r1" />
    <Label htmlFor="r1">Option 1</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option2" id="r2" />
    <Label htmlFor="r2">Option 2</Label>
  </div>
</RadioGroup>`}
        notes="Always pair RadioGroupItem with a Label. Use defaultValue to pre-select an option."
      />

      {/* Avatars */}
      <ComponentShowcase
        id="avatars"
        title="Avatars"
        description="User profile images and initials"
        preview={
          <div className="flex gap-4 items-center">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>

            <Avatar>
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>

            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-[#ff592b] text-white">AB</AvatarFallback>
            </Avatar>

            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-emerald-100 text-emerald-800 text-lg">XY</AvatarFallback>
            </Avatar>
          </div>
        }
        code={`import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// With image
<Avatar>
  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>

// Initials only
<Avatar>
  <AvatarFallback>JD</AvatarFallback>
</Avatar>

// Custom size and color
<Avatar className="h-12 w-12">
  <AvatarFallback className="bg-[#ff592b] text-white">AB</AvatarFallback>
</Avatar>`}
        notes="AvatarFallback displays initials when image fails to load. Customize size with h-* and w-* classes."
      />

      {/* More components note */}
      <div className="bg-[#f2f2f1] border border-[#e6e6e9] rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">Additional Components</h3>
        <p className="text-sm text-[#6b7280] mb-3">
          For more components not shown here, explore the <code className="bg-white px-1 py-0.5 rounded">/src/components/ui/</code> directory:
        </p>
        <ul className="text-sm text-[#6b7280] space-y-1 ml-4 list-disc">
          <li>Command palette & Combobox</li>
          <li>Calendar & Date picker</li>
          <li>Slider & Range inputs</li>
          <li>Sheet & Drawer (side panels)</li>
          <li>Hover card & Context menu</li>
          <li>Navigation menu & Breadcrumb</li>
          <li>Collapsible & Toggle components</li>
          <li>Carousel & Image galleries</li>
          <li>And 50+ more specialized components</li>
        </ul>
      </div>
    </div>
  );
}
