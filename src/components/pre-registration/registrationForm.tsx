"use client";

import { ChangeEvent, useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, User, MapPin, Navigation, Upload, Camera, ArrowLeft, CheckCircle, ShieldCheck, CreditCard, Home } from "lucide-react";

import regionData from "@/address/region.json";
import provinceData from "@/address/province.json";
import cityData from "@/address/cities.json";
import barangayRaw from "@/address/barangay.json";
import { getBarangaysAction } from "@/lib/actions/barangay.action";
import { getPuroksByBarangayAction } from "@/lib/actions/purok.action";
import { Barangay } from "@/types/barangay-management";
import { Purok } from "@/types/purok-management";

interface BarangayEntry {
  brgy_code: string;
  brgy_name: string;
  city_code: string;
  province_code: string;
  region_code: string;
}

const barangayData = barangayRaw as BarangayEntry[];

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PreRegForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(true);
  const router = useRouter();
  // State for form fields
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
  });

  // State for the loading/scanning animation
  const [isScanning, setIsScanning] = useState(false);

  // Address cascade state
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [selectedPurok, setSelectedPurok] = useState("");
  const [pickupPoint, setPickupPoint] = useState("");
  const [dbBarangays, setDbBarangays] = useState<Barangay[]>([]);
  const [puroks, setPuroks] = useState<Purok[]>([]);
  const [isFetchingPuroks, setIsFetchingPuroks] = useState(false);

  // Filtered lists derived from selections
  const filteredProvinces = useMemo(
    () => provinceData.filter((p) => p.region_code === selectedRegion),
    [selectedRegion]
  );

  const filteredCities = useMemo(
    () => cityData.filter((c) => c.province_code === selectedProvince),
    [selectedProvince]
  );

  const filteredBarangays = useMemo(
    () => barangayData.filter((b) => b.city_code === selectedCity),
    [selectedCity]
  );

  // Fetch all barangays from database on mount
  useEffect(() => {
    const fetchDbBarangays = async () => {
      const result = await getBarangaysAction();
      if (result.success) {
        setDbBarangays(result.data || []);
      }
    };
    fetchDbBarangays();
  }, []);

  // Fetch puroks when selected barangay changes
  useEffect(() => {
    const fetchPuroks = async () => {
      if (!selectedBarangay) {
        setPuroks([]);
        return;
      }

      // Find the matching barangay in the database by name
      const currentBrgyName = barangayData.find(b => b.brgy_code === selectedBarangay)?.brgy_name;
      const dbBrgy = dbBarangays.find(b => b.barangay_name.toLowerCase() === currentBrgyName?.toLowerCase());

      if (dbBrgy) {
        setIsFetchingPuroks(true);
        const result = await getPuroksByBarangayAction(dbBrgy.id);
        if (result.success) {
          setPuroks(result.data || []);
        } else {
          setPuroks([]);
        }
        setIsFetchingPuroks(false);
      } else {
        setPuroks([]);
      }
    };

    fetchPuroks();
  }, [selectedBarangay, dbBarangays]);

  // This function runs IMMEDIATELY when a file is picked
  const handleAutoScan = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Start the loading UI
    setIsScanning(true);

    const body = new FormData();
    body.append("file", file);

    try {
      // 2. Call your Python FastAPI backend
      const response = await fetch("http://localhost:8000/extract-id-data", {
        method: "POST",
        body: body,
      });

      if (!response.ok) throw new Error("OCR Server Error");

      const data = await response.json();

      // 3. Auto-fill the fields with the results from Python
      setFormData({
        firstName: data.first_name || "",
        middleName: data.middle_name || "",
        lastName: data.last_name || "",
        suffix: data.suffix || "",
      });

      // 4. Close the modal after successful scan
      setIsScanModalOpen(false);

    } catch (error) {
      console.error("Scan failed:", error);
      alert("Could not read ID. Please enter details manually.");
    } finally {
      // 4. Stop the loading UI
      setIsScanning(false);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Simple simulation of an API call to your Knex backend
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success("Registration Successful!");
        router.push("/login");
      } else {
        toast.error("Registration failed. Please check your details.");
      }
    } catch (error) {
      toast.error("An error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full flex justify-center py-10">
      {/* INITIAL SCAN MODAL */}
      <Dialog open={isScanModalOpen} onOpenChange={setIsScanModalOpen}>
        <DialogContent className="sm:max-w-xl p-0 border-none bg-transparent shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Verify Identity</DialogTitle>
            <DialogDescription>Upload your ID for automatic profile setup</DialogDescription>
          </DialogHeader>
          <Card className="w-full shadow-2xl border-t-4 border-t-primary rounded-none overflow-hidden">
            <CardHeader className="space-y-1 pb-6 text-center bg-gray-50/50">
              <div className="flex justify-center mb-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-white border rounded-full text-[10px] font-bold uppercase tracking-widest text-primary shadow-sm">
                  <ShieldCheck className="h-3 w-3" />
                  Secure Registration
                </div>
              </div>
              <CardTitle className="text-3xl font-black italic tracking-tight text-gray-900">
                Verify Identity
              </CardTitle>
              <CardDescription className="text-gray-500 font-medium">
                Upload your ID for automatic profile setup
              </CardDescription>
              
              <div className="flex items-center justify-center gap-4 mt-6">
                <div className="h-2 w-16 rounded-full bg-primary" />
                <div className="h-2 w-16 rounded-full bg-gray-200" />
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-8 py-4">
                <div className="relative group">
                  <Input
                    id="id_upload_modal"
                    name="id_card_image_modal"
                    type="file"
                    accept="image/*"
                    onChange={handleAutoScan}
                    disabled={isScanning}
                    className="hidden"
                  />
                  <label
                    htmlFor="id_upload_modal"
                    className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-none transition-all duration-300 cursor-pointer 
                      ${isScanning 
                        ? "bg-gray-50 border-gray-300 cursor-not-allowed" 
                        : "bg-white border-primary/30 hover:border-primary hover:bg-primary/5 shadow-sm hover:shadow-md"}`}
                  >
                    {isScanning ? (
                      <div className="flex flex-col items-center gap-4 px-6 text-center">
                        <div className="relative">
                          <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
                          <Camera className="h-8 w-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
                          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent animate-pulse rounded-full" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xl font-bold italic text-primary">Scanning ID...</p>
                          <p className="text-sm text-gray-400">Our AI is extracting your details</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4 px-6 text-center">
                        <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                          <Upload className="h-10 w-10 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xl font-bold text-gray-900 italic">Click to Upload ID</p>
                          <p className="text-sm text-gray-500">National ID, Driver's License, or Passport</p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>

                <div className="flex flex-col gap-3">
                  <p className="text-center text-[10px] text-gray-400 italic font-medium">
                    * Advanced AI processing ensures your data is handled securely
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

    <Card className="w-full max-w-2xl shadow-xl border-t-4 border-t-primary rounded-none overflow-hidden">
      <CardHeader className="space-y-1 pb-6 text-center bg-gray-50/50">
        <CardTitle className="text-3xl font-black italic tracking-tight text-gray-900">
          Pre-Registration
        </CardTitle>
        <CardDescription className="text-gray-500 font-medium">
          Fill in your details to create an account
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-6">
          {/* Section: Personal Information */}
          <div className="grid gap-4">
            <div className="flex items-center gap-2 border-b pb-1">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Personal Information</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="f_name">First Name</Label>
                <Input
                  name="f_name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  readOnly
                  className="bg-gray-100 cursor-not-allowed font-medium text-gray-700"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="m_name">Middle Name</Label>
                <Input
                  name="m_name"
                  value={formData.middleName}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  readOnly
                  className="bg-gray-100 cursor-not-allowed font-medium text-gray-700"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="l_name">Last Name</Label>
                <Input
                  name="l_name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  readOnly
                  className="bg-gray-100 cursor-not-allowed font-medium text-gray-700"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name_ext">Extension</Label>
                <Input
                  name="name_ext"
                  value={formData.suffix}
                  placeholder="Extension"
                  onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                  readOnly
                  className="bg-gray-100 cursor-not-allowed font-medium text-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Section: Contact & Education */}
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contact_no">Contact Number</Label>
                <Input
                  id="contact_no"
                  name="contact_no"
                  type="tel"
                  placeholder="09123456789"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email_address">Email Address</Label>
                <Input
                  id="email_address"
                  name="email_address"
                  type="email"
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="highest_education_attainment">
                  Education Attainment
                </Label>
                <Select name="highest_education_attainment">
                  <SelectTrigger id="highest_education_attainment">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="elementary">Elementary</SelectItem>
                    <SelectItem value="high_school">High School</SelectItem>
                    <SelectItem value="vocational">Vocational</SelectItem>
                    <SelectItem value="college">College Graduate</SelectItem>
                    <SelectItem value="graduate_studies">
                      Graduate Studies
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          {/* Section: Account & Verification */}
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="signature">Signature Image</Label>
                <Input
                  id="signature"
                  name="signature"
                  type="file"
                  accept="image/*"
                  className="cursor-pointer file:cursor-pointer file:text-sm file:font-medium"
                  required
                />
              </div>
            </div>
          </div>
          {/* Section: Birth Information */}
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date_of_birth">Birth Date</Label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="place_of_birth">Place of Birth</Label>
                <Input
                  id="place_of_birth"
                  name="place_of_birth"
                  placeholder="City/Province"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="mother_maiden_name">Mother's Maiden Name</Label>
                <Input
                  id="mother_maiden_name"
                  name="mother_maiden_name"
                  placeholder="Full Maiden Name"
                  required
                />
              </div>
            </div>
          </div>
          {/* Section: Socio-Economic Information */}
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="religion">Religion</Label>
                <Select name="religion">
                  <SelectTrigger id="religion">
                    <SelectValue placeholder="Select Religion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Roman Catholic">
                      Roman Catholic
                    </SelectItem>
                    <SelectItem value="Islam">Islam</SelectItem>
                    <SelectItem value="Iglesia ni Cristo">
                      Iglesia ni Cristo
                    </SelectItem>
                    <SelectItem value="Seventh-day Adventist">
                      Seventh-day Adventist
                    </SelectItem>
                    <SelectItem value="Bible Baptist Church">
                      Bible Baptist Church
                    </SelectItem>
                    <SelectItem value="Jehovah's Witnesses">
                      Jehovah's Witnesses
                    </SelectItem>
                    <SelectItem value="Church of Christ">
                      Church of Christ
                    </SelectItem>
                    <SelectItem value="United Church of Christ in the Philippines">
                      UCCP
                    </SelectItem>
                    <SelectItem value="Evangelical">
                      Evangelical Christian
                    </SelectItem>
                    <SelectItem value="Buddhism">Buddhism</SelectItem>
                    <SelectItem value="Hinduism">Hinduism</SelectItem>
                    <SelectItem value="Atheist/Agnostic">
                      Atheist/Agnostic
                    </SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  name="occupation"
                  placeholder="e.g. Farmer, Teacher, None"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="monthly_income">Monthly Income</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">
                    ₱
                  </span>
                  <Input
                    id="monthly_income"
                    name="monthly_income"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-7"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Section: Status & Type */}
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="gender">Gender</Label>
                <Select name="gender" required>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    <SelectItem value="Prefer not to say">
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="registered_as">Registration Type</Label>
                <Select name="registered_as" required>
                  <SelectTrigger id="registered_as">
                    <SelectValue placeholder="Register as..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Family Member">Family Member</SelectItem>
                    <SelectItem value="Solo Resident">Solo Resident</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="civil_status">Civil Status</Label>
                <Select name="civil_status" required>
                  <SelectTrigger id="civil_status">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Married">Married</SelectItem>
                    <SelectItem value="Widowed">Widowed</SelectItem>
                    <SelectItem value="Separated">Separated</SelectItem>
                    <SelectItem value="Common-Law">
                      Common-Law / Live-in
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          {/* Section: Identification & Verification */}
          <div className="grid gap-4 ">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="id_card_presented">ID Card Presented</Label>
                <Select name="id_card_presented" required>
                  <SelectTrigger id="id_card_presented">
                    <SelectValue placeholder="Select ID Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="National ID">
                      National ID (PhilSys)
                    </SelectItem>
                    <SelectItem value="Drivers License">
                      Driver's License
                    </SelectItem>
                    <SelectItem value="UMID">UMID</SelectItem>
                    <SelectItem value="Passport">Passport</SelectItem>
                    <SelectItem value="Voters ID">Voter's ID</SelectItem>
                    <SelectItem value="Postal ID">Postal ID</SelectItem>
                    <SelectItem value="PRC ID">PRC ID</SelectItem>
                    <SelectItem value="Senior Citizen ID">
                      Senior Citizen ID
                    </SelectItem>
                    <SelectItem value="Other">Other Valid ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="id_card_number">ID Card Number</Label>
                <Input
                  id="id_card_number"
                  name="id_card_number"
                  placeholder="e.g. 1234-5678-9012"
                  required
                />
              </div>


            </div>
          </div>
          {/* Section: Additional Details & Profile Pic */}
          <div className="grid gap-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* 4Ps Beneficiary */}
              <div className="grid gap-2">
                <Label htmlFor="is_4ps">4Ps Beneficiary</Label>
                <Select name="is_4ps" required>
                  <SelectTrigger id="is_4ps">
                    <SelectValue placeholder="Are you a beneficiary?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Indigenous People (IP) */}
              <div className="grid gap-2">
                <Label htmlFor="is_ip">Indigenous People (IP)</Label>
                <Select name="is_ip" required>
                  <SelectTrigger id="is_ip">
                    <SelectValue placeholder="Member of IP group?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Profile Picture Upload */}
              <div className="grid gap-2">
                <Label htmlFor="profile_pic">Profile Picture</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="profile_pic"
                    name="profile_pic"
                    type="file"
                    accept="image/*"
                    className="cursor-pointer"
                  />
                </div>
              </div>

            </div>
          </div>
          <div className="flex items-center gap-2 border-b pb-1 mt-6">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Address Information</span>
          </div>
          {/* Section: Location / Address */}
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Region */}
              <div className="grid gap-2">
                <Label htmlFor="region">Region</Label>
                <Select
                  name="region"
                  required
                  value={selectedRegion}
                  onValueChange={(value) => {
                    setSelectedRegion(value);
                    setSelectedProvince("");
                    setSelectedCity("");
                    setSelectedBarangay("");
                    setSelectedPurok("");
                    setPickupPoint("");
                  }}
                >
                  <SelectTrigger id="region">
                    <SelectValue placeholder="Select Region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regionData.map((r) => (
                      <SelectItem key={r.region_code} value={r.region_code}>
                        {r.region_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Province */}
              <div className="grid gap-2">
                <Label htmlFor="province">Province</Label>
                <Select
                  name="province"
                  required
                  value={selectedProvince}
                  disabled={!selectedRegion}
                  onValueChange={(value) => {
                    setSelectedProvince(value);
                    setSelectedCity("");
                    setSelectedBarangay("");
                    setSelectedPurok("");
                    setPickupPoint("");
                  }}
                >
                  <SelectTrigger id="province">
                    <SelectValue placeholder={selectedRegion ? "Select Province" : "Select a region first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredProvinces.map((p) => (
                      <SelectItem key={p.province_code} value={p.province_code}>
                        {p.province_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City / Municipality */}
              <div className="grid gap-2">
                <Label htmlFor="city">City / Municipality</Label>
                <Select
                  name="city"
                  required
                  value={selectedCity}
                  disabled={!selectedProvince}
                  onValueChange={(value) => {
                    setSelectedCity(value);
                    setSelectedBarangay("");
                    setSelectedPurok("");
                    setPickupPoint("");
                  }}
                >
                  <SelectTrigger id="city">
                    <SelectValue placeholder={selectedProvince ? "Select City" : "Select a province first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCities.map((c) => (
                      <SelectItem key={c.city_code} value={c.city_code}>
                        {c.city_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>
          </div>
          {/* Section: Specific Address Details */}
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* District */}
              <div className="grid gap-2">
                <Label htmlFor="district">District</Label>
                <Select name="district">
                  <SelectTrigger id="district">
                    <SelectValue placeholder="Select District" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="district_1">District 1</SelectItem>
                    <SelectItem value="district_2">District 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Barangay */}
              <div className="grid gap-2">
                <Label htmlFor="barangay">Barangay</Label>
                <Select
                  name="barangay_id"
                  required
                  value={selectedBarangay}
                  disabled={!selectedCity}
                  onValueChange={(value) => {
                    setSelectedBarangay(value);
                    setSelectedPurok("");
                    setPickupPoint("");
                  }}
                >
                  <SelectTrigger id="barangay">
                    <SelectValue placeholder={selectedCity ? "Select Barangay" : "Select a city first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredBarangays.map((b) => (
                      <SelectItem key={b.brgy_code} value={b.brgy_code}>
                        {b.brgy_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* House / Block / Lot Number */}
              <div className="grid gap-2">
                <Label htmlFor="house_number">House / Block / Lot No.</Label>
                <Input
                  id="house_number"
                  name="house_number"
                  placeholder="e.g. Blk 1 Lot 2 or House No. 123"
                />
              </div>

            </div>
          </div>
          {/* Section: Street, Subdivision, and Zip Code */}
          <div className="grid gap-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Street Name */}
              <div className="grid gap-2">
                <Label htmlFor="street">Street Name</Label>
                <Input
                  id="street"
                  name="street"
                  placeholder="e.g. Rizal St. or Burgos St."
                />
              </div>

              {/* Subdivision / Village */}
              <div className="grid gap-2">
                <Label htmlFor="subdivision">Subdivision / Village</Label>
                <Input
                  id="subdivision"
                  name="subdivision"
                  placeholder="e.g. Green Village or Camella"
                />
              </div>

              {/* Zip Code */}
              <div className="grid gap-2">
                <Label htmlFor="zip_code">Zip Code</Label>
                <Input
                  id="zip_code"
                  name="zip_code"
                  placeholder="e.g. 6101"
                  maxLength={4}
                  type="text"
                  inputMode="numeric"
                />
              </div>

            </div>
          </div>
          {/* Row: Purok, Street, and Subdivision */}
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Purok */}
              <div className="grid gap-2">
                <Label htmlFor="purok">Purok</Label>
                <Select 
                  name="purok" 
                  required 
                  disabled={!selectedBarangay || isFetchingPuroks}
                  value={selectedPurok}
                  onValueChange={(value) => {
                    setSelectedPurok(value);
                    const purok = puroks.find(p => p.purok_name === value);
                    if (purok) {
                      setPickupPoint(purok.pickup_point_name || "");
                    }
                  }}
                >
                  <SelectTrigger id="purok">
                    <SelectValue placeholder={
                      isFetchingPuroks 
                        ? "Loading..." 
                        : !selectedBarangay 
                          ? "Select barangay first" 
                          : puroks.length === 0 
                            ? "No puroks found" 
                            : "Select Purok"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {puroks.map((p) => (
                      <SelectItem key={p.id} value={p.purok_name}>
                        {p.purok_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 border-b pb-1 mt-6">
            <Navigation className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Pickup Point Location</span>
          </div>
          {/* Section: Logistics & Accessibility */}
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Pickup Point Name */}
              <div className="grid gap-2">
                <Label htmlFor="pickup_point">Pickup Point Name</Label>
                <Input
                  id="pickup_point"
                  name="pickup_point"
                  value={pickupPoint}
                  readOnly
                  placeholder="Select a purok first"
                  className="bg-gray-50 cursor-not-allowed"
                />
              </div>

              {/* Have Vehicle? */}
              <div className="grid gap-2">
                <Label htmlFor="has_vehicle">Vehicle Ownership</Label>
                <Select name="has_vehicle" required>
                  <SelectTrigger id="has_vehicle">
                    <SelectValue placeholder="Do you have a vehicle?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Vehicle Type (Conditional field idea) */}
              <div className="grid gap-2">
                <Label htmlFor="vehicle_type">Vehicle Type (if any)</Label>
                <Select name="vehicle_type">
                  <SelectTrigger id="vehicle_type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                    <SelectItem value="Tricycle">Tricycle</SelectItem>
                    <SelectItem value="Car/SUV">Car / SUV</SelectItem>
                    <SelectItem value="Bicycle">Bicycle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>
          </div>
          {/* Row: Destination & Special Needs */}
          <div className="grid gap-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Intended to Go */}
              <div className="grid gap-2">
                <Label htmlFor="destination">Intended Destination</Label>
                <Input
                  id="destination"
                  name="destination"
                  placeholder="e.g. Bago City Coliseum / Relative's House"
                />
              </div>

              {/* Special Needs */}
              <div className="grid gap-2">
                <Label htmlFor="special_needs">Special Needs / Physical Assistance</Label>
                <Select name="special_needs" required>
                  <SelectTrigger id="special_needs">
                    <SelectValue placeholder="Do you have special needs?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="PWD">PWD (Person with Disability)</SelectItem>
                    <SelectItem value="Senior Citizen">Senior Citizen</SelectItem>
                    <SelectItem value="Pregnant">Pregnant</SelectItem>
                    <SelectItem value="Medical Condition">Requires Medical Assistance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>
          </div>

          <div className="flex items-center gap-2 border-b pb-1 mt-6">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Account & Property Information (Optional)</span>
          </div>

          {/* Section: Bank & Account Info */}
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="bank_Ewallet">Bank / E-Wallet</Label>
                <Input
                  id="bank_Ewallet"
                  name="bank_Ewallet"
                  placeholder="e.g. GCash, Maya, BDO"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="account_name">Account Name</Label>
                <Input
                  id="account_name"
                  name="account_name"
                  placeholder="Full Name on Account"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="account_number">Account Number</Label>
                <Input
                  id="account_number"
                  name="account_number"
                  placeholder="e.g. 09123456789"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div className="grid gap-2">
                <Label htmlFor="account_type">Account Type</Label>
                <Select name="account_type">
                  <SelectTrigger id="account_type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Savings">Savings</SelectItem>
                    <SelectItem value="Current">Current</SelectItem>
                    <SelectItem value="Wallet">Digital Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="house_ownership">House Ownership</Label>
                <Select name="house_ownership">
                  <SelectTrigger id="house_ownership">
                    <SelectValue placeholder="Select ownership" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Owned">Owned</SelectItem>
                    <SelectItem value="Rented">Rented</SelectItem>
                    <SelectItem value="Living with Relatives">Living with Relatives</SelectItem>
                    <SelectItem value="Informal Settler">Informal Settler</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="shelter_damage_classification">Shelter Damage Classification</Label>
                <Select name="shelter_damage_classification">
                  <SelectTrigger id="shelter_damage_classification">
                    <SelectValue placeholder="Select classification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">No Damage</SelectItem>
                    <SelectItem value="Partially Damaged">Partially Damaged</SelectItem>
                    <SelectItem value="Totally Damaged">Totally Damaged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <Button className="w-full mt-4" type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Registering..." : "Complete Registration"}
          </Button>
        </CardContent>
      </form>
    </Card>
    </div>
  );
}
