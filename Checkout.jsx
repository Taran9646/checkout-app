import {
    useApi,
    reactExtension,
    Heading,
    Grid,
    Select,
    useShippingAddress,
    useSettings,
    useShop,
    useApplyAttributeChange,
    InlineLayout,
    Spinner,
    SkeletonText,
    View,
    useTranslate,
    useLanguage,
    useBuyerJourneyIntercept,
    useExtensionCapability,
    useAppMetafields,
} from "@shopify/ui-extensions-react/checkout";
import { useEffect, useState } from "react";

export default reactExtension(
    // "purchase.checkout.delivery-address.city.render-before",
    "purchase.checkout.delivery-address.render-after",
    // 'purchase.checkout.delivery-address.render-before',
    // 'purchase.checkout.shipping-option-item.details.render',
    // 'purchase.checkout.shipping-option-item.render-after',
    // 'purchase.checkout.shipping-option-list.render-after',
    // 'purchase.checkout.shipping-option-list.render-before',
    () => <Extension />
);

function Extension() {
    const { extension } = useApi();
    const apiUrl = "https://phpstack-362288-4452147.cloudwaysapps.com/api/";
    const address = useShippingAddress();
    const applyAttributeChange = useApplyAttributeChange();
    const settings = useSettings();
    const language = useLanguage();
    const [data, setData] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedCityErr, setSelectedCityErr] = useState("");
    const [districts, setDistricts] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedDistrictErr, setSelectedDistrictErr] = useState("");
    const [subdistricts, setSubdistricts] = useState([]);
    const [selectedSubdistrict, setSelectedSubdistrict] = useState("");
    const [selectedSubdistrictErr, setSelectedSubdistrictErr] = useState("");
    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingCityChange, setIsLoadingCityChange] = useState(false);
    const [isLoadingDistrictChange, setIsLoadingDistrictChange] =
        useState(false);
    const canBlockProgress = useExtensionCapability("block_progress");

    useBuyerJourneyIntercept(({ canBlockProgress }) => {
        if (canBlockProgress && selectedCity === "") {
            return {
                behavior: "block",
                reason: "City is required",
                perform: (result) => {
                    if (result.behavior === "block") {
                        setSelectedCityErr(
                            `${
                                language?.isoCode == "en"
                                    ? settings?.validation_message_city_ENG
                                    : settings?.validation_message_city_IND
                            }`
                        );
                    }
                },
            };
        }

        if (canBlockProgress && selectedDistrict === "") {
            return {
                behavior: "block",
                reason: "District is required",
                perform: (result) => {
                    if (result.behavior === "block") {
                        setSelectedDistrictErr(
                            `${
                                language?.isoCode == "en"
                                    ? settings?.validation_message_district_ENG
                                    : settings?.validation_message_district_IND
                            }`
                        );
                    }
                },
            };
        }

        // if (canBlockProgress && selectedSubdistrict === "") {
        //     return {
        //         behavior: "block",
        //         reason: "Subdistrict is required",
        //         perform: (result) => {
        //             if (result.behavior === "block") {
        //                 setSelectedSubdistrictErr(
        //                     `${
        //                         language?.isoCode == "en"
        //                             ? settings?.validation_message_subdistrict_ENG
        //                             : settings?.validation_message_subdistrict_IND
        //                     }`
        //                 );
        //             }
        //         },
        //     };
        // }

        return {
            behavior: "allow",
            perform: () => {
                clearValidationErrors();
            },
        };
    });

    function clearValidationErrors() {
        setSelectedCityErr("");
        setSelectedDistrictErr("");
        setSelectedSubdistrictErr("");
    }

    useEffect(() => {
        fetch(settings?.addresses_file_url)
            .then((response) => response.json())
            .then((jsonData) => {
                setData(jsonData?.INDAddresses);
                setLoading(false); // Set loading to false after data is fetched and set
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                setLoading(false); // Also set loading to false in case of an error
            });
    }, [settings?.addresses_file_url]);

    useEffect(() => {
        setSelectedCity("");
        setSelectedDistrict("");
        setSelectedSubdistrict("");
        setSubdistricts([]);
        setDistricts([]);
        const filteredCities = data?.filter(
            (location) => {

console.log(location?.code , address);
               return  location?.code === address?.countryCode
            }
        );
      
        console.log('filteredCities',filteredCities)

        
        const uniqueCities = [
            ...new Set(filteredCities.map((city) => city?.city)),
        ];
      
        console.log('uniqueCities',uniqueCities)
        setCities(uniqueCities);
    }, [data, address?.provinceCode]);

    const handleCityChange = async (value) => {
        // setIsLoadingCityChange(true); // Show loader for city change
        setSelectedCity(value);
        setSelectedCityErr("");
        setSelectedDistrict("");
        setSelectedSubdistrict("");

        // Filter districts based on the selected city
        const selectedCityDistricts = data
            ?.filter((city) => city?.city === value)
            .map((city) => city?.district);
        setDistricts([...new Set(selectedCityDistricts)]);
        // Filter subdistricts based on the selected city
        // const selectedCitySubdistricts = data
        //     ?.filter((city) => city.city === value)
        //     .map((city) => city?.subdistrict);
        // setSubdistricts([...new Set(selectedCitySubdistricts)]);
        // // Set the first index of districts and subdistricts as the initial selected values
        // if (selectedCityDistricts.length > 0) {
        //     setSelectedDistrict(selectedCityDistricts[0]);
        // }
        // if (selectedCitySubdistricts.length > 0) {
        //     setSelectedSubdistrict(selectedCitySubdistricts[0]);
        // }

        // Hide city change loader after 1 second
        // setTimeout(() => {
        //     setIsLoadingCityChange(false);
        // }, 1000);
    };

    useEffect(() => {
        const updateAttribute = async () => {
            const result = await applyAttributeChange({
                type: "updateAttribute",
                key:
                    settings?.target_save_note_key_for_city == null
                        ? "City"
                        : `${settings?.target_save_note_key_for_city}`,
                value: `${selectedCity}`,
            });
        };

        updateAttribute();
    }, [settings?.target_save_note_key_for_city, selectedCity]);

    const handleDistrictChange = async (value) => {
        setSelectedDistrictErr("");
        setSelectedDistrict(value);
        setSelectedSubdistrict("");

        // Filter subdistricts based on the selected district
        const selectedDistrictSubdistricts = data
            ?.filter((city) => city?.district === value)
            .map((city) => city?.subdistrict);
        setSubdistricts([...new Set(selectedDistrictSubdistricts)]);
    };

    useEffect(() => {
        const updateAttribute = async () => {
            const result = await applyAttributeChange({
                type: "updateAttribute",
                key:
                    settings?.target_save_note_key_for_district == null
                        ? "District"
                        : `${settings?.target_save_note_key_for_district}`,
                value: `${selectedDistrict}`,
            });
        };


        updateAttribute();
    }, [settings?.target_save_note_key_for_district, selectedDistrict]);

    const handleSubdistrictChange = async (value) => {
        setSelectedSubdistrict(value);
        setSelectedSubdistrictErr("");
    };

    useEffect(() => {
        const updateAttribute = async () => {
            const result = await applyAttributeChange({
                type: "updateAttribute",
                key:
                    settings?.target_save_note_key_for_subdistrict == null
                        ? "Subdistrict"
                        : `${settings?.target_save_note_key_for_subdistrict}`,
                value: `${selectedSubdistrict}`,
            });
        };

        updateAttribute();
    }, [settings?.target_save_note_key_for_subdistrict, selectedSubdistrict]);

    return address?.countryCode == "SA" ? (
        // return true? (
        <Grid
            columns={["49%", "49%"]}
            spacing="loose"
        >
            {loading ? (
                <>
                    <View
                        inlineAlignment="start"
                        border={"base"}
                        borderWidth={"base"}
                        borderRadius={"base"}
                        padding={"base"}
                    >
                        <SkeletonText size="small" />
                    </View>
                    <View
                        inlineAlignment="start"
                        border={"base"}
                        borderWidth={"base"}
                        borderRadius={"base"}
                        padding={"base"}
                    >
                        <SkeletonText size="small" />
                    </View>
                    <View
                        inlineAlignment="start"
                        border={"base"}
                        borderWidth={"base"}
                        borderRadius={"base"}
                        padding={"base"}
                    >
                        <SkeletonText size="small" />
                    </View>
                </>
            ) : (
                <>
        
                    <Select
            
                        label={
                            language?.isoCode == "en" &&
                            settings?.label_city_ENG == null
                                ? `${
                                      selectedCity == ""
                                          ? "Select City"
                                          : "City"
                                  }`
                                : language?.isoCode == "en" &&
                                  settings?.label_city_ENG !== null
                                ? `${
                                      selectedCity == ""
                                          ? `Select ${settings?.label_city_ENG}`
                                          : settings?.label_city_ENG
                                  }`
                                : language?.isoCode !== "en" &&
                                  settings?.label_city_IND == null
                                ? `${
                                      selectedCity == "" ? "Pilih Kota" : "Kota"
                                  }`
                                : `${
                                      selectedCity == ""
                                          ? `Pilih ${settings?.label_city_IND}`
                                          : settings?.label_city_IND
                                  }`
                        }
                        value={selectedCity}
                        options={cities?.map((city) => ({
                            value: city,
                            label: city,
                        }))}
                        onChange={(value) => handleCityChange(value)}
                        required={canBlockProgress}
                        error={selectedCityErr}
                    />
                    <Select
                        label={
                            language?.isoCode == "en" &&
                            settings?.label_district_ENG == null
                                ? `${
                                      selectedDistrict == ""
                                          ? "Select District"
                                          : "District"
                                  }`
                                : language?.isoCode == "en" &&
                                  settings?.label_district_ENG !== null
                                ? `${
                                      selectedDistrict == ""
                                          ? `Select ${settings?.label_district_ENG}`
                                          : settings?.label_district_ENG
                                  }`
                                : language?.isoCode !== "en" &&
                                  settings?.label_district_IND == null
                                ? `${
                                      selectedDistrict == ""
                                          ? "Pilih Daerah"
                                          : "Daerah"
                                  }`
                                : `${
                                      selectedDistrict == ""
                                          ? `Pilih ${settings?.label_district_IND}`
                                          : settings?.label_district_IND
                                  }`
                        }
                        value={selectedDistrict}
                        options={districts?.map((district) => ({
                            value: district,
                            label: district,
                        }))}
                        onChange={(value) => handleDistrictChange(value)}
                        required={canBlockProgress}
                        error={selectedDistrictErr}
                    />
                    {/* <Select
                        label={
                            language?.isoCode == "en" &&
                            settings?.label_subdistrict_ENG == null
                                ? `${
                                      selectedSubdistrict == ""
                                          ? "Select Subdistrict"
                                          : "Subdistrict"
                                  }`
                                : language?.isoCode == "en" &&
                                  settings?.label_subdistrict_ENG !== null
                                ? `${
                                      selectedSubdistrict == ""
                                          ? `Select ${settings?.label_subdistrict_ENG}`
                                          : settings?.label_subdistrict_ENG
                                  }`
                                : language?.isoCode !== "en" &&
                                  settings?.label_subdistrict_IND == null
                                ? `${
                                      selectedSubdistrict == ""
                                          ? "Pilih Kecamatan"
                                          : "Kecamatan"
                                  }`
                                : `${
                                      selectedSubdistrict == ""
                                          ? `Pilih ${settings?.label_subdistrict_IND}`
                                          : settings?.label_subdistrict_IND
                                  }`
                        }
                        value={selectedSubdistrict}
                        options={subdistricts?.map((subdistrict) => ({
                            value: subdistrict,
                            label: subdistrict,
                        }))}
                        onChange={(value) => handleSubdistrictChange(value)}
                        required={canBlockProgress}
                        error={selectedSubdistrictErr}
                    /> */}
                </>
            )}
        </Grid>
    ) : (
        ""
    );
}
