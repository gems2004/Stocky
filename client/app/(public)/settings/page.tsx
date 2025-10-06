"use client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function Settings() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8 px-4">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        {/* User Profile Section */}
        <Card className="shadow-none">
          <CardHeader className="p-4 pb-2 border-b border-gray-200">
            <CardTitle className="text-2xl font-bold text-primary">User Profile</CardTitle>
            <CardDescription>Manage your personal information and account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" defaultValue="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue="johndoe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue="john.doe@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" defaultValue="+1 (555) 123-4567" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Save Changes
            </Button>
          </CardFooter>
        </Card>

        {/* Shop Info Section */}
        <Card className="shadow-none">
          <CardHeader className="p-4 pb-2 border-b border-gray-200">
            <CardTitle className="text-2xl font-bold text-primary">Shop Information</CardTitle>
            <CardDescription>Manage your shop details and business information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shopName">Shop Name</Label>
              <Input id="shopName" defaultValue="My Awesome Shop" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shopAddress">Shop Address</Label>
              <Input id="shopAddress" defaultValue="123 Main Street, City, State 12345" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input id="taxRate" type="number" defaultValue="8.5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select defaultValue="USD">
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">US Dollar (USD)</SelectItem>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                    <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Select defaultValue="retail">
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="wholesale">Wholesale</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="online">Online Store</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Save Changes
            </Button>
          </CardFooter>
        </Card>

        {/* Database Connection Section */}
        <Card className="shadow-none">
          <CardHeader className="p-4 pb-2 border-b border-gray-200">
            <CardTitle className="text-2xl font-bold text-primary">Database Connection</CardTitle>
            <CardDescription>Configure your database connection settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="databaseType">Database Type</Label>
                <Select defaultValue="postgresql">
                  <SelectTrigger>
                    <SelectValue placeholder="Select database type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postgresql">PostgreSQL</SelectItem>
                    <SelectItem value="mysql">MySQL</SelectItem>
                    <SelectItem value="sqlite">SQLite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input id="port" defaultValue="5432" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="host">Host</Label>
              <Input id="host" defaultValue="localhost" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="databaseName">Database Name</Label>
              <Input id="databaseName" defaultValue="stocky_db" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tablePrefix">Table Prefix</Label>
              <Input id="tablePrefix" defaultValue="stocky_" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue="admin" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sslEnabled">SSL Encryption</Label>
              <Select defaultValue="disabled">
                <SelectTrigger>
                  <SelectValue placeholder="Select SSL option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                  <SelectItem value="required">Required</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
