"use client";
import React, { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import withAuth from "@/components/withAuth";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useUploadThing } from "@/components/uploadthing";
import * as z from "zod";
const Component: React.FC = () => {
  const [isScheduled, setIsScheduled] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captionRef = useRef<HTMLTextAreaElement>(null);
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [url, setUrl] = useState<string>("/placeholder.svg");
  const [imageObject, setImageObject] = useState<File | null>(null);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { startUpload, permittedFileInfo } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      alert("uploaded successfully!");
    },
    onUploadError: (res) => {
      alert("error occurred while uploading");
    },
    onUploadBegin: () => {
      alert("upload has begun");
    },
  });
  const formSchema = z.object({
    imageObject: z
      .instanceof(File)
      .refine(
        (file) =>
          file.type === "image/png" ||
          file.type === "image/jpg" ||
          file.type === "image/jpeg",
        "Only PNG, JPG, and JPEG files are allowed"
      ),
    caption: z.string().min(1, "Caption is required"),
    date: z
      .date()
      .refine((val) => val > new Date(), "Date must be in the future")
      .optional(),
    hour: z
      .string()
      .refine((val) => !isNaN(parseInt(val)), "Invalid hour format")
      .refine((val) => val.length === 2, "Hour must be in 24-hour format")
      .optional(),
  });
  const handleSubmit = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND;
      if (isScheduled) {
        const caption = captionRef.current?.value || "";
        const formData = {
          imageObject,
          caption,
          date,
          hour: selectedHour,
        };

        setValidationErrors([]);

        const validatedData = await formSchema.parseAsync(formData);

        if (validatedData.imageObject) {
          const uploadResponse = await startUpload([validatedData.imageObject]);
          if (uploadResponse && uploadResponse.length > 0) {
            console.log("Upload response:", uploadResponse[0].url);
          } else {
            console.error("Invalid upload response");
          }
        } else {
          console.log("No image selected.");
        }
        if (validatedData.date && validatedData.hour) {
          const scheduledTime = new Date(
            validatedData.date.getFullYear(),
            validatedData.date.getMonth(),
            validatedData.date.getDate(),
            parseInt(validatedData.hour)
          );

          if (scheduledTime > new Date()) {
            console.log("Scheduled post for:", scheduledTime);
            console.log("Caption:", validatedData.caption);
          } else {
            console.error("Scheduled time must be in the future");
          }
        } else {
          console.log("Post caption:", validatedData.caption);
        }
      } else {
        const caption = captionRef.current?.value || "";
        const formData = {
          imageObject,
          caption,
        };

        const validatedData = await formSchema.parseAsync(formData);
        if (validatedData.imageObject) {
          const uploadResponse = await startUpload([validatedData.imageObject]);
          if (uploadResponse && uploadResponse.length > 0) {
            console.log("Upload response:", uploadResponse[0].url);
            const imageurl = uploadResponse[0].url;
            const token = sessionStorage.getItem("token");
            const response = await fetch(backendUrl+"/api/createpost", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({ caption: validatedData.caption, url: imageurl, isScheduled: false}),
            });
            const responseData = await response.json();
            if (response.ok) {
              console.log("Post created successfully");
            } else {
              console.error("Error creating post:", responseData.message);
            }
          } else {
            console.error("Invalid upload response");
          }
        } else {
          console.log("No image selected.");
        }
        console.log("Post caption:", validatedData.caption);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = err.flatten().fieldErrors;
        const errorMessages = Object.values(errors)
          .flatMap((issue) => issue)
          .filter((issue): issue is string => typeof issue === "string");
        setValidationErrors(errorMessages);
        console.log("Validation errors:", errorMessages);
      } else {
        console.error("Error occurred while submitting:", err);
      }
    }
  };
  const fileTypes = permittedFileInfo?.config
    ? Object.keys(permittedFileInfo?.config)
    : [];
  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setImageObject(file);
      getBase64(file)
        .then((base64) => handleFiles({ base64 }))
        .catch((error) =>
          console.error("Error converting file to base64:", error)
        );
    } else {
      setImageObject(null);
    }
  };

  const handleScheduleToggle = () => {
    setIsScheduled((prev) => !prev);
  };

  const handleFiles = (files: { base64: React.SetStateAction<string> }) => {
    console.log(files);
    setUrl(files.base64);
  };

  return (
    <>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <div className="flex justify-center items-start h-screen bg-white dark:bg-gray-950">
        <div className="w-full max-w-4xl bg-white rounded-lg dark:bg-gray-900 p-6 flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden dark:bg-gray-800">
              <img
                src={url}
                alt="Post Image"
                width={400}
                height={400}
                className="object-cover w-full h-full"
              />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*"
              />
              <button
                className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md dark:bg-gray-800"
                onClick={() => fileInputRef.current?.click()}
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Upload a single image for your post
            </p>
          </div>
          <div className="flex-1 space-y-6">
            <h1 className="text-2xl font-bold">Create Post</h1>
            <div>
              <label
                htmlFor="caption"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Caption
              </label>
              <Textarea
                id="caption"
                rows={3}
                className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                placeholder="Write a caption..."
                ref={captionRef}
              />
            </div>
            <div className="flex items-center">
              <label
                htmlFor="schedule"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 mr-4"
              >
                Schedule
              </label>
              <div className="flex items-center">
                <div className="relative">
                  <Switch
                    id="schedule"
                    onCheckedChange={handleScheduleToggle}
                    checked={isScheduled}
                  />
                </div>
                {isScheduled && (
                  <div className="flex items-center gap-4 ml-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <CalendarIcon className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-4">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          className="rounded-md border"
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <ClockIcon className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-4">
                        <div className="grid grid-cols-1 gap-4">
                          <Select
                            onValueChange={(value) => setSelectedHour(value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Hour" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => (
                                <SelectItem
                                  key={i}
                                  value={i.toString().padStart(2, "0")}
                                >
                                  {i.toString().padStart(2, "0")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            </div>
            <br />
            <Button className="w-full" onClick={handleSubmit}>
              Post
            </Button>{" "}
          </div>
          {validationErrors.length > 0 && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <ul>
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
const CalendarDaysIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
    <path d="M8 14h.01" />
    <path d="M12 14h.01" />
    <path d="M16 14h.01" />
    <path d="M8 18h.01" />
    <path d="M12 18h.01" />
    <path d="M16 18h.01" />
  </svg>
);

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);
interface CalendarIconProps extends React.SVGProps<SVGSVGElement> {}

const CalendarIcon: React.FC<CalendarIconProps> = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
};
interface ClockIconProps extends React.SVGProps<SVGSVGElement> {}

const ClockIcon: React.FC<ClockIconProps> = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
};
export default withAuth(Component);
